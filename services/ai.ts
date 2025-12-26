import { GoogleGenAI, Type } from "@google/genai";
import { SkiConfig } from "../types";

// Using gemini-3-flash-preview as requested for best balance of speed and reasoning
const MODEL_NAME = "gemini-3-flash-preview";

export const generateSkiSpecs = async (prompt: string): Promise<Partial<SkiConfig>> => {
  // Directly use process.env.API_KEY as per strict SDK guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are the Chief Design Engineer at SEARL Custom Workshop.
    Your job is to translate user desires (terrain, style, aesthetic vibe) into precise manufacturing specifications for Skis or Snowboards.

    1. **Identify the Type**: Look for keywords. If the user mentions "riding", "strapping in", "park board", "knuckle huck", assume Snowboard. If "skiing", "poles", "chutes", "touring", assume Ski.
    
    2. **Ski Dimensions logic**:
       - Powder: Wide waist (110mm+), Rocker, Pointed/Tapered Tip.
       - Park: Narrow waist (85-95mm), Camber, Twin Tip.
       - All Mountain: Mid waist (95-105mm), Hybrid profile.
    
    3. **Snowboard Dimensions logic**:
       - Powder: Directional shape, setback, wide nose, often shorter and fatter (Volume Shift).
       - Park/Jib: True Twin, softer, shorter length.
       - Carving: Stiff, camber, directional.

    4. **Aesthetics**:
       - Match the "vibe" to colors. 
       - "Stealth" = Matte Black/Grey, exposed carbon.
       - "Loud/Retro" = Neon colors, splatter or geometric patterns.
       - "Classic/Natural" = Wood veneer, earth tones.
    
    Return a JSON object with the specs. Include a 'reasoning' field (max 1 sentence) explaining the technical choice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['ski', 'snowboard'] },
            length: { type: Type.NUMBER },
            tipWidth: { type: Type.NUMBER },
            waistWidth: { type: Type.NUMBER },
            tailWidth: { type: Type.NUMBER },
            camberProfile: { type: Type.STRING, enum: ['camber', 'rocker', 'hybrid'] },
            tipShape: { type: Type.STRING, enum: ['rounded', 'blunt', 'pointed'] },
            tailShape: { type: Type.STRING, enum: ['flat', 'twin', 'partial'] },
            topColor: { type: Type.STRING },
            logoColor: { type: Type.STRING },
            sidewallColor: { type: Type.STRING },
            woodCore: { type: Type.STRING, enum: ['maple', 'paulownia', 'poplar'] },
            topPattern: { type: Type.STRING },
            topFinish: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};