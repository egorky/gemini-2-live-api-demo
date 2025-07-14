import { fetchConfig, getWebsocketUrl, getConfig, getDeepgramApiKey, getModelSampleRate, shouldRespondWithText } from './config/config.js';
import { GeminiAgent } from './main/agent.js';
import { ToolManager } from './tools/tool-manager.js';
import { GoogleSearchTool } from './tools/google-search.js';
import { elements } from './dom/elements.js';
import { eventHandlers } from './dom/events.js';

class App {
    constructor() {
        this.agent = null;
        this.toolManager = new ToolManager();
        this.isDisconnecting = false;
        this.isRecording = false;
        this.finalTranscript = '';
        this.isSpeaking = false;
        this.initialize();
    }

    async initialize() {
        try {
            console.log('Initializing application...');
            await fetchConfig();
            this.setup();
            console.log('Application initialized.');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            alert('Failed to load configuration. Please check the server and refresh the page.');
        }
    }

    setup() {
        this.registerTools();
        this.attachEventListeners();
        this.connect(); // Automatically connect on load
    }

    registerTools() {
        console.log('Registering tools...');
        const googleSearchTool = new GoogleSearchTool();
        this.toolManager.register(googleSearchTool);
    }

    attachEventListeners() {
        console.log('Attaching event listeners...');
        elements.connectBtn.addEventListener('click', () => this.connect());
        elements.disconnectBtn.addEventListener('click', () => this.disconnect());
        elements.micBtn.addEventListener('click', () => this.toggleMic());
        elements.cameraBtn.addEventListener('click', () => this.toggleCamera());
        elements.screenBtn.addEventListener('click', () => this.toggleScreen());
        elements.sendBtn.addEventListener('click', () => this.sendTextMessage());
        elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendTextMessage();
            }
        });

        const cameraSwitchBtn = document.querySelector('.camera-switch-btn');
        if (cameraSwitchBtn) {
            cameraSwitchBtn.addEventListener('click', () => this.switchCamera());
        }
    }

    async connect() {
        if (this.agent && this.agent.connected) {
            console.warn('Already connected.');
            return;
        }

        console.log('Connecting to Gemini...');
        try {
            const config = getConfig();
            const deepgramApiKey = getDeepgramApiKey();
            const modelSampleRate = getModelSampleRate();

            this.agent = new GeminiAgent({
                url: getWebsocketUrl(),
                config: config,
                toolManager: this.toolManager,
                modelSampleRate: modelSampleRate,
                deepgramApiKey: deepgramApiKey,
                transcribeModelsSpeech: true,
                transcribeUsersSpeech: false,
                textResponse: shouldRespondWithText()
            });

            this.setupAgentEventListeners();
            await this.agent.connect();
            await this.agent.initialize();

            this.updateUIForConnection();
            console.log('Connected to Gemini.');

        } catch (error) {
            console.error('Connection failed:', error);
            alert('Failed to connect. Check console for details.');
        }
    }

    async disconnect() {
        if (!this.agent || !this.agent.connected || this.isDisconnecting) {
            return;
        }

        console.log('Disconnecting from Gemini...');
        this.isDisconnecting = true;
        try {
            await this.agent.disconnect();
        } catch (error) {
            console.error('Error during disconnection:', error);
        } finally {
            this.agent = null;
            this.isDisconnecting = false;
            this.updateUIForDisconnection();
            console.log('Disconnected from Gemini.');
        }
    }

    setupAgentEventListeners() {
        console.log('Setting up agent event listeners...');
        this.agent.on('interrupted', () => {
            console.log('Model speech interrupted');
        });

        this.agent.on('turn_complete', () => {
            console.log('Model turn complete');
        });

        this.agent.on('transcription', (transcript) => {
            eventHandlers.onTranscription(transcript, this.isSpeaking);
        });

        this.agent.on('user_transcription', (transcript) => {
            console.log('User transcription:', transcript);
        });

        this.agent.on('text_sent', (text) => {
            eventHandlers.onTextSent(text);
        });

        this.agent.client.on('text', (text) => {
            eventHandlers.onTextReceived(text, this.isSpeaking);
        });

        this.agent.client.on('audio', () => {
            this.isSpeaking = true;
        });

        this.agent.client.on('turn_complete', () => {
            this.isSpeaking = false;
        });

        this.agent.on('screenshare_stopped', () => {
            elements.screenBtn.classList.remove('active');
        });
    }

    updateUIForConnection() {
        elements.connectBtn.style.display = 'none';
        elements.disconnectBtn.style.display = 'block';
        elements.micBtn.classList.add('active');
        this.isRecording = true;
    }

    updateUIForDisconnection() {
        elements.connectBtn.style.display = 'block';
        elements.disconnectBtn.style.display = 'none';
        elements.micBtn.classList.remove('active');
        elements.cameraBtn.classList.remove('active');
        elements.screenBtn.classList.remove('active');
        elements.cameraPreview.style.display = 'none';
        elements.screenPreview.style.display = 'none';
        this.isRecording = false;
    }

    async toggleMic() {
        if (!this.agent) return;
        console.log('Toggling microphone...');
        await this.agent.toggleMic();
        this.isRecording = !this.isRecording;
        elements.micBtn.classList.toggle('active');
        console.log(`Microphone is now ${this.isRecording ? 'on' : 'off'}`);
    }

    async toggleCamera() {
        if (!this.agent) return;

        const isActive = elements.cameraBtn.classList.toggle('active');
        console.log(`Toggling camera ${isActive ? 'on' : 'off'}...`);
        if (isActive) {
            await this.agent.startCameraCapture();
            elements.cameraPreview.style.display = 'block';
            elements.cameraPreview.appendChild(this.agent.cameraManager.videoElement);
        } else {
            await this.agent.stopCameraCapture();
            elements.cameraPreview.style.display = 'none';
        }
        console.log(`Camera is now ${isActive ? 'on' : 'off'}`);
    }

    async switchCamera() {
        if (!this.agent || !this.agent.cameraManager) return;
        console.log('Switching camera...');
        try {
            await this.agent.cameraManager.switchCamera();
            console.log('Camera switched.');
        } catch (error) {
            console.error('Failed to switch camera:', error);
        }
    }

    async toggleScreen() {
        if (!this.agent) return;

        const isActive = elements.screenBtn.classList.toggle('active');
        console.log(`Toggling screen sharing ${isActive ? 'on' : 'off'}...`);
        if (isActive) {
            await this.agent.startScreenShare();
            elements.screenPreview.style.display = 'block';
            elements.screenPreview.appendChild(this.agent.screenManager.videoElement);
        } else {
            await this.agent.stopScreenShare();
            elements.screenPreview.style.display = 'none';
        }
        console.log(`Screen sharing is now ${isActive ? 'on' : 'off'}`);
    }

    sendTextMessage() {
        const text = elements.messageInput.value;
        if (text.trim() && this.agent) {
            console.log(`Sending text message: "${text}"`);
            this.agent.sendText(text);
            elements.messageInput.value = '';
        }
    }
}

// Initialize the application
window.addEventListener('load', () => new App());