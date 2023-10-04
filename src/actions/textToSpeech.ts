import fetch from 'node-fetch';
import fs from 'fs';
import { Action } from '@/interfaces/action';
import dotenv from 'dotenv'; 
dotenv.config();
class TextToSpeechAction implements Action {
  name = 'text_to_speech';
  description = 'Converts text to speech and returns the path to the generated audio file.';
  arguments = [
    {
      name: 'text',
      type: 'string',
      description: 'The text to be converted to speech.',
      required: true
    },
    {
      name: 'play',
      type: 'boolean',
      description: 'Play the audio file after it is generated.',
      required: true,
      default: true
    }
  ];

  async run(args: { text: string, play: boolean }): Promise<string> {
    const { text } = args;
    let voice_id = '21m00Tcm4TlvDq8ikWAM';
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/stream`;
    const headers = {
      Accept: 'audio/mpeg',
      'xi-api-key': process.env.ELEVENLABS_API_KEY, // Use environment variable
      'Content-Type': 'application/json'
    };

    const reqBody = JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 1,
        similarity_boost: 0.5
      }
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        // @ts-ignore
        headers: headers,
        body: reqBody
      });

      if (!response.ok) {
        return JSON.stringify(`Speech to Text failed: ${response.statusText}`);
      }

      // Assuming the response is the audio data
      const audioBuffer = await response.buffer();
      
      // Save the audio file to the desired location
      const audioFilePath = 'speak.mp3'; // Update the path as needed
      fs.writeFileSync(audioFilePath, audioBuffer);
      // if(args.play) {
        // Play the audio file
        const util = require('util');
        const exec = util.promisify(require('child_process').exec);
        // for mac
        if(process.platform === 'darwin') {
          await exec(`afplay ${audioFilePath}`);
        } else if(process.platform === 'linux') {
          // for linux
          await exec(`play ${audioFilePath}`);
        } else {
          // for windows
          await exec(`start ${audioFilePath}`);
        }
      // }      
      return audioFilePath;

    } catch (error) {
      return JSON.stringify(error);
    }
  }
}

export default TextToSpeechAction;
