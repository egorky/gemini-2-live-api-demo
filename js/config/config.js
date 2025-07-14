let config = null;

export const fetchConfig = async () => {
    try {
        console.info('Fetching configuration from server...');
        const response = await fetch('/config');
        if (!response.ok) {
            throw new Error(`Failed to fetch config: ${response.statusText}`);
        }
        config = await response.json();
        console.info('Configuration loaded successfully:', config);
    } catch (error) {
        console.error('Error fetching configuration:', error);
        throw error;
    }
};

export const getWebsocketUrl = () => {
    if (!config || !config.geminiApiKey) {
        throw new Error('Configuration or Gemini API key is not loaded.');
    }
    return `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${config.geminiApiKey}`;
};

export const getDeepgramApiKey = () => {
    return config ? config.deepgramApiKey : '';
};

export const getModelSampleRate = () => {
    return config && config.modelSampleRate ? parseInt(config.modelSampleRate) : 24000;
};

export const getLanguage = () => {
    return config ? config.language : 'en-US';
}

export const shouldRespondWithText = () => {
    return config ? config.textResponse : false;
}

export const getConfig = () => {
    if (!config) {
        throw new Error('Configuration is not loaded.');
    }

    const geminiConfig = { ...config };
    delete geminiConfig.geminiApiKey;
    delete geminiConfig.deepgramApiKey;
    delete geminiConfig.language;
    delete geminiConfig.textResponse;

    if (shouldRespondWithText()) {
        geminiConfig.generationConfig.responseModalities = "text";
    }

    return geminiConfig;
};