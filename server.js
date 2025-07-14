require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Endpoint to get the configuration
app.get('/config', (req, res) => {
    fs.readFile('config.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading config.json:', err);
            return res.status(500).json({ error: 'Failed to load configuration.' });
        }
        try {
            const config = JSON.parse(data);
            const fullConfig = {
                ...config,
                geminiApiKey: process.env.GEMINI_API_KEY,
                deepgramApiKey: process.env.DEEPGRAM_API_KEY,
                language: process.env.LANGUAGE || 'en-US',
                textResponse: process.env.TEXT_RESPONSE === 'true'
            };
            res.json(fullConfig);
        } catch (error) {
            console.error('Error parsing config.json:', error);
            res.status(500).json({ error: 'Failed to parse configuration.' });
        }
    });
});

// HTTPS options
const httpsOptions = {
    key: fs.readFileSync(process.env.HTTPS_KEY_PATH),
    cert: fs.readFileSync(process.env.HTTPS_CERT_PATH)
};

https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`Server running at https://localhost:${port}/`);
});
