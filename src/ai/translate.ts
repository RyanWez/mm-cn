'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}
// The client gets the API key from the environment variable 'GEMINI_API_KEY`
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface TranslateCustomerQueryInput {
  query: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export async function translateCustomerQuery(input: TranslateCustomerQueryInput): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Translate the following ${input.sourceLanguage} customer service query to ${input.targetLanguage}, optimizing for phrases commonly used in online betting customer service:

Query: ${input.query}

Return only the translated text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to get translation from AI.");
  }
}
