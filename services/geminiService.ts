import { GoogleGenAI } from "@google/genai";

export const generateExcuse = async (score: number): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables");
    return "The budget got lost in a spreadsheet somewhere.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a funny, cynical marketing executive. You just lost the company budget (score: $${score}).
        Give me a very short, witty 1-sentence excuse to tell the Finance Director (CFO).
        Examples: 
        - "We're pivoting to an organic-only growth strategy."
        - "It's not a loss, it's a brand awareness investment."
        - "The ROI is intangible but spiritual."
        Make it sound like buzzword-filled corporate jargon.
      `,
      config: {
        maxOutputTokens: 50,
        thinkingConfig: { thinkingBudget: 0 },
        temperature: 0.9,
      }
    });
    
    return response.text?.trim() || "Let's circle back on the budget variance next quarter.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The algorithm ate my homework.";
  }
};