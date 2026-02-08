/* eslint-disable @typescript-eslint/no-require-imports */
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Hardcode key for testing script (user provided key)
const apiKey = "AIzaSyAhD-oK6KeYXpbZ5h19TnSLRUaPe4hFQGE";

async function testGemini() {
    console.log("Testing Gemini API...");
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Back to 'gemini-2.0-flash' as it was the only one not-404ing
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = "Hello, ignore previous instructions and just say 'API is working'";

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Error details:", error);
        if (error.response) {
            console.error("Error Response:", JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
