import { Action } from "../interfaces/action";
import fs from "fs";
import path from "path";
import { join } from "path";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import OpenAI from "openai";
import dotenv from "dotenv";
import prompts from "prompts";
import os from "os";
import Agent from "./workerAgent";
import { AgentOptions, IAgent } from "@/interfaces/agent";

dotenv.config();

class PlanningAgent implements IAgent {
  name?: string;
  // @todo: use llm instead and allow the user to specify the model
  model = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  worker?: Agent;
  score = 100;
  messages: any[] = [];
  systemMessage = "You are a helpful assistant";
  functions: { [key: string]: Action } = {};
  actions: { [key: string]: any } = {};
  memory: any = {
    lastAction: null, // Name of the last action
    lastActionStatus: null, // 'success' or 'failure'
  }; // A basic representation of agent's memory. Can be replaced with a more sophisticated data structure.
  objectives: any[] = []; // Agent's objectives.
  options: AgentOptions = { actionsPath: "" };
  currentObjective: any = null; // The current objective that the agent is trying to achieve.
  currentMessages: any[] = [];

  constructor(options: AgentOptions) {
    // Load actions from the specified actionsPath.
    this.loadFunctions(options.actionsPath);
    if (options.systemMessage) {
      this.systemMessage = options.systemMessage;
    }
    this.actions = this.getFunctionsDefinitions();
  }

  async listen(): Promise<string> {
    return await this.functions["speech_to_text"].run({});
  }

  async think(useFunctionCalls = true): Promise<any> {
    try {
      const systemMessage = {
        role: "system",
        content: `${this.systemMessage}\n${JSON.stringify(await this.sense())}`,
      };
  
      const messages = [systemMessage, ...this.messages];
      this.currentMessages = messages;
      const functions = this.actions;
      let decision = await this.model.chat.completions.create(
        // @ts-ignore
        {
        messages:
          this.currentMessages.length > 10
            ? [
                this.currentMessages[0],
                ...this.currentMessages.slice(this.currentMessages.length - 10),
              ]
            : this.currentMessages,
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        ...(useFunctionCalls ? { functions: functions } : {})
  
      });

  
      return decision;
      
    } catch (error) {
      throw new Error('An error occurred while thinking');
    }
  }

  async speak(text: string, useLocal = false): Promise<void> {
    if (!useLocal) {
      // We request openai to suggest a text that can be spoken
      const response = await this.model.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
          Generate a Siri-friendly speech from the following text, capturing all key points while omitting or rephrasing unsuitable content.          `,
          },
          {
            role: "user",
            content: text,
          },
        ],
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        max_tokens: 64,
        temperature: 0.8,
      }); // Add 'as any' to bypass the type checking error
      text = response.choices[0].message.content || text;
    }
    if (os.platform() === "darwin") {
      // we use execute_code action and Siri to speak the text
      await this.functions["execute_code"].run({
        code: `say "${text}"`,
        language: "applescript",
      });
      // @todo: add support for other platforms
    } else {
      const filename = await this.functions["text_to_speech"].run({ text });
      // play audio file
      const player = require("play-sound")({});
      await player.play(filename);
    }
  }

  public displayMessage(message: string) {
    marked.setOptions({
      renderer: new TerminalRenderer(),
    });
    console.log(marked(message));
  }
  private loadFunctions(actionsPath: string) {
    const actionFiles = fs.readdirSync(
      join(path.resolve(__dirname, actionsPath))
    );
    actionFiles.forEach((file) => {
      const actionClass = require(path.join(actionsPath, file)).default;
      const actionInstance: Action = new actionClass();
      if (
        [
          "execute_code",
          "text_to_speech",
          "speech_to_text",
          "prompt_user",
        ].includes(actionInstance.name)
      ) {
        this.functions[actionInstance.name] = actionInstance;
      }
    });
  }

  async sense(): Promise<any> {
    return new Promise((resolve) => {
      // @todo: provide more context information
      resolve({
        agent: {
          name: "Saiku",
        },
        os: process.platform,
        version: process.version,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        // provide date and time
        date: new Date().toLocaleDateString(),
        start_time: new Date().toLocaleTimeString(),
        // provide location information
        cwd: process.cwd(),
        // provide information about the current user
        user: {
          name: process.env.ME,
          country: process.env.COUNTRY,
          city: process.env.CITY,
          company: process.env.COMPANY,
          phone: process.env.PHONE,
        },
        // ...this.memory,
      });
    });
  }

  async act(actionName: string, args: any): Promise<string> {
    try {
      const action = this.functions[actionName];
      this.displayMessage(
        `_Executing action **${actionName}: ${action.description}**_`
      );
      if (action) {
        try {
          // @ts-ignore
          const output = await action.run(args);
          await this.updateMemory({
            lastAction: actionName,
            lastActionStatus: "success",
          });
          return output;
        } catch (error) {
          await this.updateMemory({
            lastAction: actionName,
            lastActionStatus: "failure",
          });
          return JSON.stringify(error);
        }
      } else {
        this.displayMessage(`No action found with name: **${actionName}**`);
        return "Action not found";
      }
    } catch (error) {
      return JSON.stringify(error);
    }
  }

  evaluatePerformance(): number {
    // Evaluate the agent's performance based on its objectives.
    // Returns a score. For now, we return a placeholder value.
    return this.score;
  }

  // manage the agent's memory
  remember(key: string, value: any): void {
    this.memory[key] = value;
  }

  recall(key: string): any {
    return this.memory[key];
  }

  forget(key: string): void {
    delete this.memory[key];
  }
  saveMemory(): void {
    // we save the agent's memory to a file
    fs.writeFileSync(
      path.join(__dirname, "../data/memory.json"),
      JSON.stringify(this.memory)
    );
  }
  getMemory(): any {
    // @todo: we retrieve the agent's memory and long-term memory
    return this.memory;
  }

  updateMemory(args: any): any {
    this.memory = {
      ...this.memory,
      ...args,
    };
  }
  async interact(): Promise<void> {
    marked.setOptions({
      renderer: new TerminalRenderer(),
    });
    let hasFunctionCall = true;
    // if don't have a plan, get one
    if (this.memory.plan === undefined) {
      this.messages.push({
        role: "system",
        content: `
        Based on the user's request, create a detailed plan of actionable tasks to achieve our objective. Please break down any repetitive actions into individual tasks. If the objective can be achieved in a single step, specify the task without creating a plan. Do not suggest specific functions to be used, as it's the responsibility of the worker agent to decide on the function calls.

        User's Request: ${this.messages.find(msg => msg.role === 'user')?.content}
        
        ---
        
        Plan:
        
        ---
        
        `,
      });
      // we don't use function calls for the first interaction
      hasFunctionCall = false;
    }
    let decision = await this.think(false);

    const functionCall = decision.choices[0].message.function_call;
    let content = decision.choices[0].message.content;

    if (content) {
      this.messages.push({
        role: "assistant",
        content,
      });
      if (this.memory.plan === undefined) {
        this.updateMemory({
          plan: content,
        });
      }
      // get the current task
      const currentTaskMessage = {
        role: "system",
        content: `
        Based on the current plan  ${this.memory.plan},\n
        and the list of completed actions ${JSON.stringify(
          this.memory.completedActions?.map((action: any) => action.task)
        )},\n
        Formulate the next task in the sequence as a direct user request to be executed by the executing agent. Ensure to reference any relevant information from the previous action's results, including specifying the filename or path when necessary.

        Example task:
        "Read the content of the PDF file located at '/path/to/file.pdf' using the appropriate function."
        
        Constraints:
        Our agent performs one task at a time. Any required data to run the action must be included, like the path to the file to read. Our agent does not perform actions with loops; a separate task must be assigned."
                `,
      };
      this.messages.push(currentTaskMessage);
      const nextTaskDecision = await this.think(false);
      const currentTask = nextTaskDecision.choices[0].message.content;
      // let the worker execute the task
      this.worker?.messages.push({
        role: "user",
        content: currentTask,
      });
      
      content = await this.worker?.interact();
      // Update the plan
  const updatePlanPrompt = `
  Based on the user's input, the worker's available functions, and the history of completed actions
  update the current plan to reflect the changes.
`;
this.messages.push({ role: "system", content: updatePlanPrompt });
const updatedPlanDecision = await this.think(false);
const updatedPlan = updatedPlanDecision.choices[0].message.content;
this.updateMemory({ plan: updatedPlan });

// Store completed actions in memory
const completedAction = { task: currentTask, result: content };
this.updateMemory({
  completedActions: [...(this.memory.completedActions || []), completedAction]
});
      this.messages.push({
        role: "system",
        content: `
        The worker agent has completed the task **${currentTask}**.\n
        Based on the current plan ${this.memory.plan}\n,
        and the list of completed actions ${JSON.stringify(
          this.memory.completedActions?.map((action: any) => action.task)
        )},\n
        Formulate the next task in the sequence as a direct user request to be executed by _${this.worker?.name}_. 
        Type **HALT** to stop the execution when done.\n
        Ensure to reference any relevant information from the previous task's results while formulating the next task.
                `
      });

      decision = await this.think(false);
      content = decision.choices[0].message.content;
      if (content.toLowerCase().includes("halt")) {
        // we stop the execution and display the final answer
        this.messages.push({
          role: "system",
          content: `
          Based on the initial user request ${this.messages.find(msg => msg.role === 'user')?.content},\n 
          Answer in a friendly manner the user's request.
          `,
        });
        decision = await this.think(false);
        content = decision.choices[0].message.content;
        this.messages.push({
          role: "assistant",
          content,
        });
        if (["both", "output"].includes(this.options.speech)) {
          await this.speak(content);
        }
        console.log(marked(content));
        this.updateMemory({
          lastAction: null,
          lastActionStatus: null,
        });
      } else {
        return await this.interact();
      }
    } else {
      let actionName = functionCall?.name ?? "";
      let args = functionCall?.arguments ?? "";
      let result: any = "";
      // We avoid executing if the last action is the same as the current action
      if (this.memory.lastAction === actionName) {
        this.displayMessage(
          `Repeated error with action: **${actionName}**. Stopping execution.`
        );
        this.updateMemory({
          lastAction: null,
          lastActionStatus: null,
        });
        return;
      }
      try {
        args = JSON.parse(functionCall?.arguments ?? "");
        if (this.worker) {
          // Delegate the task to the worker and await the result
          result = await this.worker.act(actionName, args);
        } else {
          if (!this.options.allowCodeExecution) {
            // request to execute code
            const { answer } = await prompts({
              type: "confirm",
              name: "answer",
              message: `Do you want to execute the code?`,
              initial: true,
            });
            if (!answer) {
              result = "Code execution cancelled for current action only";
            } else {
              result = await this.act(actionName, args);
            }
          } else {
            result = await this.act(actionName, args);
          }
        }
      } catch (error) {
        result = JSON.stringify(error);
      }

      this.messages.push({
        role: "function",
        name: actionName,
        content: result,
      });

      return await this.interact();
    }
  }

  getFunctionsDefinitions(): any {
    const actions = Object.values(this.functions).map((action) => ({
      name: action.name,
      description: action.description,
      arguments: action.arguments,
    }));
    return actions.map((action: any) => ({
      name: action.name,
      description: action.description,
      parameters: {
        type: "object",
        properties: action.arguments.reduce((acc: any, arg: any) => {
          acc[arg.name] = { type: arg.type };
          if (arg.description) {
            acc[arg.name].description = arg.description;
          }
          if (arg.type === "array" && arg.items) {
            // Include items if the type is array and items is defined
            acc[arg.name].items = arg.items;
          }
          return acc;
        }, {}),
      },
      required: action.arguments
        .filter((arg: any) => arg.required)
        .map((arg: any) => arg.name),
    }));
  }
}

export default PlanningAgent;
