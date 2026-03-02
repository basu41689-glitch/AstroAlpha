import OpenAI from "openai";

// Use actual API key if available, otherwise use a demo key for development
const apiKey = process.env.OPENAI_API_KEY || "sk-demo-dev-key";
const client = new OpenAI({ apiKey });

export default client;
