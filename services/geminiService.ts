
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeScanContent = async (content: string, type: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Analyze the following scanned ${type} content: "${content}". 
  Provide a concise summary of what it represents (URL, Product, WiFi, VCard, etc.) 
  and suggest the best actions to take. Keep it short and helpful. 
  If it looks like a URL, explain what the site is about if you know it. 
  If it's a series of numbers, try to identify if it's a specific product barcode.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 250,
      }
    });
    return response.text || "Unable to analyze content.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI analysis unavailable at the moment.";
  }
};
