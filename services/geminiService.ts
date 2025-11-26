import { GoogleGenAI } from "@google/genai";
import { ModelType, ProcessingStatus } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateSingleHtml = async (
  projectStructure: string,
  apiKey: string,
  onStatusUpdate: (status: Partial<ProcessingStatus>) => void
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    onStatusUpdate({ step: 'generating', message: 'Gemini is analyzing project structure...' });

    // Using Gemini 3 Pro for complex coding tasks as per guidelines
    const modelId = ModelType.GEMINI_PRO;

    const prompt = `
      Here is the file structure and content of a React project (JSON format):
      
      \`\`\`json
      ${projectStructure}
      \`\`\`
      
      Convert this into a single index.html file following the system instructions.
      Ensure all dependencies are loaded via CDN.
      Ensure all CSS is inlined.
      Ensure the script is a single valid Babel script.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        // thinkingConfig removed as it is only supported on Gemini 2.5 series
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    // Clean up potential markdown blocks
    let cleanHtml = text.trim();
    
    // Remove markdown code blocks if present
    const markdownRegex = /^```(?:html)?\s*([\s\S]*?)\s*```$/;
    const match = cleanHtml.match(markdownRegex);
    if (match) {
      cleanHtml = match[1];
    }

    // Final fallback cleanup
    if (cleanHtml.startsWith('```')) {
      cleanHtml = cleanHtml.replace(/^```(?:html)?/, '').replace(/```$/, '');
    }

    return cleanHtml;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMessage = error.message || "An error occurred while communicating with Gemini.";
    
    if (errorMessage.includes("400")) {
        errorMessage += " (Bad Request - likely model configuration or prompt issue)";
    }
    
    throw new Error(errorMessage);
  }
};