# Gemini Live Chat

This is a web-based chat application that uses the Gemini Live API to provide real-time, conversational AI. The application is designed to be easily configurable and embeddable in other web pages.

## Features

-   **Real-time Conversation**: Interact with Gemini through voice and text.
-   **Configurable**: Settings are managed through a `config.json` file and environment variables.
-   **Audio and Text Responses**: Choose whether Gemini responds with audio or text.
-   **Deepgram Integration (Optional)**: For real-time transcription of the conversation.
-   **Responsive Design**: The chat interface is designed to be embedded as a chatbox.
-   **HTTPS Server**: A simple Node.js server is included to run the application over HTTPS.
-   **Logging**: The application logs events to the console for debugging and monitoring.

## Prerequisites

-   Node.js and npm
-   A Gemini API key
-   (Optional) A Deepgram API key
-   SSL certificates for HTTPS (`key.pem` and `cert.pem`)

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/gemini-live-chat.git
    cd gemini-live-chat
    ```

2.  Install the dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file by copying the example file:
    ```bash
    cp .env.example .env
    ```

4.  Edit the `.env` file and add your API keys and other settings:
    ```
    GEMINI_API_KEY=your_gemini_api_key
    DEEPGRAM_API_KEY=your_deepgram_api_key # Optional
    LANGUAGE=en-US # e.g., en-US, es-ES
    TEXT_RESPONSE=false # true for text, false for audio
    HTTPS_KEY_PATH=./key.pem
    HTTPS_CERT_PATH=./cert.pem
    PORT=3000
    ```

5.  (Optional) If you don't have SSL certificates, you can generate self-signed ones for local development:
    ```bash
    openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -sha256 -days 365 -nodes
    ```

## Usage

1.  Start the server:
    ```bash
    npm start
    ```

2.  Open your browser and navigate to `https://localhost:3000`.

## Configuration

The application is configured through `config.json` and the `.env` file.

### `config.json`

This file contains the configuration for the Gemini model, such as the model name, generation parameters, and safety settings.

### `.env`

This file contains sensitive information and environment-specific settings:

-   `GEMINI_API_KEY`: Your Gemini API key.
-   `DEEPGRAM_API_KEY`: Your Deepgram API key (optional).
-   `LANGUAGE`: The language for Gemini's responses.
-   `TEXT_RESPONSE`: Set to `true` to receive text responses from Gemini, or `false` for audio.
-   `HTTPS_KEY_PATH`: The path to your SSL key file.
-   `HTTPS_CERT_PATH`: The path to your SSL certificate file.
-   `PORT`: The port on which the server will run.

## How to Embed

The chat application is designed to be embedded in other web pages using an `iframe`:

```html
<iframe src="https://your-domain.com" width="400" height="600" frameborder="0"></iframe>
```

## Logging

The application logs information to the browser console and the server console.

-   **Browser Console**: Logs events related to the frontend, such as UI interactions and WebSocket communication.
-   **Server Console**: Logs requests to the server and errors.

## License

This project is licensed under the ISC License.
