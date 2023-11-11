# Saiku (細工) The AI Agent

## Table of Contents

- [About](#about)
  - [Why Saiku?](#why-saiku)
  - [What is PEAS?](#what-is-peas)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Demo](#demo)
- [Usage](#usage)
  - [Command Line Options](#command-line-options)
  - [Setting Up Environment Variables](#setting-up-environment-variables)
- [Future Features](#future-features)
- [Contributing](#contributing)
- [Support Saiku](#support-saiku)
- [Feedback and Issues](#feedback-and-issues)
- [API Rate Limits/Cost](#api-rate-limitscost)
- [Note](#note)
- [License](#license)

## About

This project aims to create a robust, intelligent AI Agent capable of automating various tasks. Our agent is designed following the PEAS (Performance measure, Environment, Actuators, Sensors) framework to ensure it's robust, scalable, and efficient.

### Why Saiku?

"Saiku" (細工) in Japanese refers to detailed or delicate work, symbolizing the intricate and intelligent workings of our AI agent. 

- **S**: Smart
- **A**: Artificial
- **I**: Intelligent
- **K**: Knowledgeable
- **U**: Unmatched

We chose a Japanese name to symbolize precision, innovation, and advanced technology, attributes highly respected in Japanese culture. Even though we are based in Tunisia, we believe in global collaboration and the universal appeal and understanding of technology.

### What is PEAS?

PEAS stands for Performance measure, Environment, Actuators, and Sensors. It's a framework used to describe the various components of an intelligent agent:

- **Performance Measure**: How well is the agent doing in its environment
- **Environment**: Where the agent operates
- **Actuators**: What actions the agent can take
- **Sensors**: How the agent perceives its environment

## Features

- Modular Design
- OpenAI GPT-4 Integration
- Extensible and Customizable

## Prerequisites

- Node.js installed
- OpenAI API key

### Optional requirements
#### Google Vision
- Google Cloud SDK installed and configured with a project:
  - Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
  - Authenticate with Google Cloud: 
    ```bash
    gcloud auth login
    ```
  - Set your project ID:
    ```bash
    gcloud config set project <your-project-id>
    ```
- Enable the Google Vision API for your project:
  - Visit the [Google Cloud Console](https://console.cloud.google.com/)
  - Navigate to the 'APIs & Services > Dashboard' 
  - Click on '+ ENABLE APIS AND SERVICES', search for 'Vision API' and enable it.
#### Google Calendar, docs and sheets
 - Download the service account JSON file from your GCP project page
 
## Installation

Clone this repository:

```
git clone https://github.com/nooqta/saiku.git
```

Navigate to the project folder:

```
cd saiku
```

Install dependencies:

```
npm install
```

### Global Installation (Not Recommended Yet)

Although Saiku is available as an npm package, we are still in the early stages of development, and drastic changes to the architecture will occur. We don't recommend installing it globally yet. However, if you still wish to do so:

```
npm install -g saiku
```
## Demo

https://github.com/nooqta/saiku/assets/3036133/c8f8a983-20c6-4404-a8ad-16c3d9fab496

### A Jupyter notebook available on Google Colab:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/nooqta/saiku/blob/main/saiku-demo-notebook.ipynb)

## Usage

### Running the Project Locally

Before starting Saiku locally, build the project using the following command:

```
npm run build
```

To start the agent:

```
npm start
```

For automated building during development, use:

```
npm run watch
```

This will automatically build the project whenever files are changed, helping streamline the development process.
### Setting Up Environment Variables

Before running Saiku, configure the necessary environment variables. Copy the example environment file and then fill in the details.

```
cp .env.example .env
```

Edit the `.env` file to include your specific information:

```
# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-3.5-turbo
# Eleven Labs
ELEVENLABS_API_KEY=
# Database related
DB_HOST=
DB_USER=
DB_PASSWORD=
# Email related
EMAIL_SERVICE=
EMAIL_USER=
DISPLAY_FROM_EMAIL=
EMAIL_PASS=
# User related
USER=
COMPANY=
COUNTRY=
CITY=
PHONE=
LATITUDE=
LONGITUDE=
# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
# Weather API
WEATHER_API_KEY=
# Stability AI
STABILITY_API_KEY=
# GITLAB
GITLAB_GRAPHQL_ENDPOINT=
GITLAB_PERSONAL_ACCESS_TOKEN=
GITLAB_USERNAME=
GITLAB_VERSION=
GITLAB_API_VERSION=
```

### Command Line Options

Use Saiku with various options to tailor its operation to your needs:

```
AI agent to help automate your tasks

Options:
  -v, --version                Output the current version.
  -exec, --allowCodeExecution  Execute the code without prompting the user.
  -s, --speech <type>          Receive voice input from the user and/or output responses as speech.
                               Possible values: input, output, both, none. Default is "none".
  -role, --systemMessage       The model system role message.
  -m, --llm <model>            Specify the language model to use. 
                               Possible values: openai, vertexai, ollama, and huggingface. Default is "openai".
  -h, --help                   Display help for command.

Commands:
  action [options]             Create an action using AI (TODO).
  autopilot [options]          AI agent to help automate your tasks on autopilot mode (in progress).
  serve                        Chat with the Saiku agent in the browser.
```

## Examples:

To allow code execution without prompting:

```
saiku -exec
```
or
```
npm start -- -exec
```

To enable voice input and output:
```
saiku -s both
```
or
```
npm start -- --speech both
```

To specify a language model:
```
saiku -m huggingface
```
or
```
npm start -- --llm huggingface
```


## Future Features

- ~~**Incorporation of Diverse Models**: While currently relying on OpenAI and its code interpreter, future versions of Saiku aim to incorporate various other AI and LLM models to enhance its capabilities and versatility~~
- **Web Compatible Version**: Development of a web-compatible version of Saiku to ensure easy accessibility and integration into web-based platforms.
- **Python Version**: Creation of a Python version of Saiku to cater to Python developers and AI enthusiasts, allowing seamless integration into Python-centric projects.
- **Configuration Management**: Implementation of a robust configuration management system to ensure Saiku’s smooth and efficient operation in diverse environments.
- **Enhanced Debugging and Logging**: Improvement in debugging and logging capabilities for easier identification and resolution of issues, ensuring Saiku's robust performance.
- **Comprehensive Tests**: Development of comprehensive tests to continuously evaluate and ensure Saiku's functionality, reliability, and performance.
- ~~**Voice Commands**: Integration with technologies like Whisper for efficient and user-friendly voice command functionalities.~~
- ~~**Speaking Agent**: Implementation of Text-to-Speech technologies like Elevenlabs, enabling Saiku to interact using voice, enhancing user experience.~~
- **Enhanced Memory Handling**: Upgrades in memory handling for optimal and consistent performance.
- **Document Summarization**: Integration of document summarization features for effective handling of large textual data.
- **Advanced Actions**: Inclusion of computer vision and image interpretation capabilities, broadening the spectrum of tasks Saiku can adeptly handle.
- **OpenAI Cost Tracking**: Incorporating features to track and analyze the costs associated with OpenAI API usage, enabling better budget management and cost-efficiency.
- **Budget Settings**: Implementation of budget settings to allow users to set and manage spending limits on AI resources, ensuring cost-effective operation.
- **Multi-Agent Systems**: Exploration and integration of multi-agent systems to promote collaborative problem-solving and to enrich the PEAS framework within Saiku, potentially elevating the project's ability to handle complex, dynamic environments.
- **PEAS Enhancement**: Further refining the existing PEAS framework to accommodate a wider range of environments, actuator capabilities, and sensor inputs, aiming for a more versatile and adaptive AI agent.

## Contributing

We welcome contributions from the community. If you'd like to contribute, please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git commit push origin feature/YourFeature`)
5. Create a new Pull Request

[Contributing Guidelines](CONTRIBUTING.md).

## Support Saiku

We are actively seeking sponsors and contributors. If you believe in the potential of Saiku, support the project in any way you can. Your support will help us make Saiku a reality.

## Feedback and Issues

We value your feedback. If you encounter any issues or have suggestions for improvements, please open an issue on our GitHub repository.

## API Rate Limits/Cost

Please be aware of the rate limits and costs associated with the APIs used by Saiku. Each service provider may have different policies, and it's essential to stay informed to avoid unexpected charges.

## Note

Please note that we are in the experimental stage. The architecture and features are subject to significant changes.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
