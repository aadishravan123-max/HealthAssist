// Groq AI Integration - Free, fast, and reliable
// Get your free API key at: https://console.groq.com/keys

import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    console.warn("GROQ_API_KEY is not set. Get a free key at https://console.groq.com/keys");
}

const groq = new Groq({
    apiKey: apiKey || "",
});

// Available models: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768, gemma2-9b-it
const MODEL = "llama-3.3-70b-versatile";

export async function analyzeMedicalText(prompt: string): Promise<string> {
    if (!apiKey) {
        return "AI service unavailable. Please set GROQ_API_KEY in your environment variables. Get a free key at https://console.groq.com/keys";
    }

    try {
        console.log("Calling Groq AI with model:", MODEL);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful medical assistant. Provide accurate, concise health information in clear, scannable format. Use markdown formatting (headers, bold, bullet points) for readability. Keep responses focused and to-the-point. Always recommend consulting healthcare professionals for medical decisions.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: MODEL,
            temperature: 0.7,
            max_tokens: 600,
        });

        const response = completion.choices[0]?.message?.content;
        console.log("Groq AI response received successfully");
        return response || "No response from AI";
    } catch (error) {
        console.error("Groq AI error:", error);
        return "I encountered an error connecting to the AI service. Please try again in a moment.";
    }
}
