import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { SkiConfig } from "../types";

// Using gemini-1.5-flash as it is the current stable model for this SDK
const MODEL_NAME = "gemini-1.5-flash";

export const generateSkiSpecs = async (prompt: string): Promise<Partial<SkiConfig>> => {
  // Use the API key directly
  const genAI = new GoogleGenerativeAI(process.env.API_KEY || '');
  const model = genAI.getGenerativeModel({ 
    model: MODEL_NAME,
    systemInstruction: `
    You are the Master Artisan at FRONTIER PEAKS, a bespoke luxury alpine equipment atelier.
    Your clients are elite skiers who demand perfection. Your job is to translate their desires into an exquisite, one-of-a-kind masterpiece.

    1. **Design Philosophy**:
       - We do not make "skis". We craft "Alpine Instruments".
       - Use sophisticated language. Instead of "stiff", say "torsionally rigid for high-velocity stability".
       - Colors should be rich and organic (Deep Forest, Slate, Obsidian, Burnished Gold, Alpine White).

    2. **Technical Logic**:
       - **Powder**: Wide waist (110mm+), Rocker, Pointed Tip. Suggest Paulownia core for lightness.
       - **Piste/Carving**: Narrow waist (70-90mm), Camber, Flat Tail. Suggest Maple/Titanal for dampness.
       - **All-Mountain**: Mid waist (95-105mm), Hybrid. Suggest Poplar/Bamboo.

    3. **Aesthetics & Materials**:
       - **Texture Selection**: You MUST choose a texture filename from this list if it fits the vibe:
         - 'snow_color.jpg' (Alpine Camo, Whiteout, Glacial)
       - If none fit perfectly, return null for textureId and use colors.

    4. **Naming**:
       - Generate a unique, evocative name for this specific pair (e.g., "The Black Matter", "Alpine Phantom", "Glacier Express").

    Return a JSON object with the specs. Include a 'reasoning' field (max 2 sentences) written in the voice of the Master Artisan.
    `
  });

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      type: { type: SchemaType.STRING, enum: ['ski', 'snowboard'] },
      modelName: { type: SchemaType.STRING },
      length: { type: SchemaType.NUMBER },
      tipWidth: { type: SchemaType.NUMBER },
      waistWidth: { type: SchemaType.NUMBER },
      tailWidth: { type: SchemaType.NUMBER },
      camberProfile: { type: SchemaType.STRING, enum: ['camber', 'rocker', 'hybrid'] },
      tailShape: { type: SchemaType.STRING, enum: ['flat', 'twin', 'partial'] },
      tipShape: { type: SchemaType.STRING, enum: ['rounded', 'blunt', 'pointed'] },
      topColor: { type: SchemaType.STRING },
      sidewallColor: { type: SchemaType.STRING },
      logoColor: { type: SchemaType.STRING },
      bindingColor: { type: SchemaType.STRING },
      bindingMaterial: { type: SchemaType.STRING, enum: ['plastic', 'aluminum', 'carbon'] },
      strapColor: { type: SchemaType.STRING },
      strapTexture: { type: SchemaType.STRING, enum: ['rubber', 'fabric', 'leather'] },
      text: { type: SchemaType.STRING },
      textPosition: { type: SchemaType.STRING, enum: ['tip', 'waist', 'tail'] },
      fontStyle: { type: SchemaType.STRING, enum: ['bold', 'outline', 'stencil', 'handwritten', 'retro'] },
      woodCore: { type: SchemaType.STRING, enum: ['paulownia', 'maple', 'poplar'] },
      edgeMaterial: { type: SchemaType.STRING, enum: ['steel', 'black', 'gold'] },
      topFinish: { type: SchemaType.STRING, enum: ['glossy', 'matte', 'satin', 'metal'] },
      topPattern: { type: SchemaType.STRING, enum: ['solid', 'carbon', 'wood', 'geometric', 'camo', 'splatter', 'linear-fade', 'topo-map'] },
      textureId: { type: SchemaType.STRING, nullable: true },
      reasoning: { type: SchemaType.STRING }
    },
    required: ['type', 'modelName', 'length', 'tipWidth', 'waistWidth', 'tailWidth', 'camberProfile', 'reasoning']
  };

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};