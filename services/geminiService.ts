import { GoogleGenAI, Type } from "@google/genai";
import { DesignAnalysis } from "../types";

const SYSTEM_INSTRUCTION = `
You are a world-class Senior UI/UX Designer and Graphic Design Critic. 
Your job is to analyze images of user interfaces, websites, or graphic designs and provide a structured, professional critique.
You must be objective, technical, and precise.

**INSTRUCTIONS FOR ASSET RECOMMENDATIONS ("alternatives"):**
Critically analyze the design to identify specific components, icons, logos, and images that look outdated, generic, or low-quality. Provide at least 4 specific recommendations.
For EVERY recommendation, you MUST provide a valid, direct URL to the resource, documentation, or a relevant search page.

1. **Components**: Identify standard UI elements (buttons, inputs, cards) and suggest modern React component library equivalents (e.g., **Shadcn UI**, **Tailwind UI**, **Chakra UI**). Name the specific component and provide its documentation URL (e.g., "https://ui.shadcn.com/docs/components/card").
2. **Icons**: Identify the current icon style. Suggest switching to consistent vector libraries like **Lucide React**, **Heroicons**, or **Phosphor Icons**. Provide the link to the icon set or specific icon (e.g., "https://lucide.dev/icons/menu").
3. **Images**: Analyze image quality and relevance. Suggest high-quality sources or styles. Provide a URL to a relevant collection or search (e.g., "https://unsplash.com/s/photos/office-minimal").
4. **Logos**: Critique legibility and scalability. Suggest modernization techniques. If a specific tool or font is relevant, link to it (e.g., "https://fonts.google.com/specimen/Inter").

Focus on elevating the design to a premium, professional standard (2025 design trends).
`;

export const analyzeDesignImage = async (base64Image: string): Promise<DesignAnalysis> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });

    // Clean base64 string if it contains metadata
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            critique: { type: Type.STRING },
            colors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING },
                  name: { type: Type.STRING },
                  usage: { type: Type.STRING },
                }
              }
            },
            typography: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  family: { type: Type.STRING },
                  weight: { type: Type.STRING },
                  role: { type: Type.STRING },
                  size: { type: Type.STRING },
                }
              }
            },
            layoutAnalysis: { type: Type.STRING },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  currentDescription: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  url: { type: Type.STRING },
                }
              }
            }
          }
        }
      },
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming png for simplicity, API handles standard types
              data: cleanBase64
            }
          },
          {
            text: "Analyze this UI design. Provide a detailed JSON response."
          }
        ]
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as DesignAnalysis;

  } catch (error) {
    console.error("Analysis Failed:", error);
    // Fallback mock data in case of API failure for demonstration stability
    // In a real app, we would throw the error to the UI
    throw error;
  }
};