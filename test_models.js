
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Manually read .env.local
let apiKey;
try {
    const envPath = path.resolve(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && key.trim() === 'GEMINI_API_KEY' && values.length > 0) {
                apiKey = values.join('=').trim();
            }
        });
    }
} catch (e) {
    console.warn("Could not read .env.local", e);
}

if (!apiKey) {
    console.error("No API KEY found.");
    process.exit(1);
}

// Fetch list of models directly
async function listModels() {
    console.log("Listing models from API directly...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.error("Error listing models:", data);
        }
    } catch (e) {
        console.error("Fetch error:", e);
    }
}

listModels();
