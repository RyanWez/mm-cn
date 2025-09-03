'use server';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}
// The client gets the API key from the environment variable 'GEMINI_API_KEY`
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

interface TranslateCustomerQueryInput {
  query: string;
}

export async function translateCustomerQuery(input: TranslateCustomerQueryInput): Promise<string> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

  const prompt = `First, detect whether the following customer service query is in Burmese or Chinese. 
Then, translate it to the other language (if it's Burmese, translate to Chinese; if it's Chinese, translate to Burmese).
Optimize the translation for phrases commonly used in online betting customer service.

Query: "${input.query}"

Return only the translated text, with no extra explanations or labels.`;

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
