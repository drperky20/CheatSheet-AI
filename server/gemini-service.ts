import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { AnalysisResult, DraftResult } from "./ai-service";

// Initialize the Gemini AI client with provided API key
let apiKey: string = process.env.GEMINI_API_KEY || "AIzaSyCqIH9yPMjxBUu4Fxf-Sdlda2PzsbFoyUw";
let genAI: GoogleGenerativeAI;

// Initialize client with API key
try {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log("Gemini API client initialized successfully");
} catch (error) {
  console.error("Failed to initialize Gemini client:", error);
}

// Safety settings to avoid harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Configure the model
const getModel = () => {
  if (!genAI) {
    // Reinitialize if genAI is not available for some reason
    genAI = new GoogleGenerativeAI(apiKey);
  }
  
  return genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    safetySettings 
  });
};

/**
 * Set the API key for Gemini
 */
export function setGeminiApiKey(key: string) {
  apiKey = key;
  genAI = new GoogleGenerativeAI(key);
  console.log("Gemini API client initialized with new key");
}

/**
 * Analyze an assignment using Gemini AI
 */
export async function analyzeAssignmentWithGemini(
  description: string,
  additionalContext?: string
): Promise<AnalysisResult> {
  try {
    const model = getModel();
    
    // Build prompt for assignment analysis
    const prompt = `
    Analyze the following assignment description and provide structured information.
    
    Assignment Description:
    ${description}
    
    ${additionalContext ? `Additional Context: ${additionalContext}` : ''}
    
    Respond with a JSON structure containing the following fields:
    - assignmentType: The type of assignment (Research, Writing, Programming, Presentation, or General)
    - topics: Array of main topics covered in the assignment
    - requirements: Array of specific requirements or criteria
    - suggestedApproach: A step-by-step approach to completing this assignment
    - externalLinks: Array of any URLs mentioned that need to be researched (empty if none)
    - customPrompt: A tailored prompt that would help an AI generate a good draft for this assignment
    
    Format your response as valid JSON without any explanations or additional text.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*?}/);
    const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json\n|\n```/g, '') : text;
    
    try {
      // Parse the JSON response
      const parsedResult = JSON.parse(jsonStr) as AnalysisResult;
      
      // Ensure all required fields exist
      return {
        assignmentType: parsedResult.assignmentType || "General",
        topics: Array.isArray(parsedResult.topics) ? parsedResult.topics : [],
        requirements: Array.isArray(parsedResult.requirements) ? parsedResult.requirements : [],
        suggestedApproach: parsedResult.suggestedApproach || "",
        externalLinks: Array.isArray(parsedResult.externalLinks) ? parsedResult.externalLinks : [],
        customPrompt: parsedResult.customPrompt || ""
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON response:", parseError);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("Gemini analysis error:", error);
    throw new Error("Failed to analyze assignment with Gemini");
  }
}

/**
 * Generate assignment draft using Gemini AI
 */
export async function generateDraftWithGemini(
  analysisResult: AnalysisResult,
  additionalInstructions?: string
): Promise<DraftResult> {
  try {
    const model = getModel();
    
    // Build prompt for draft generation based on analysis
    const prompt = `
    Generate a comprehensive assignment draft based on the following analysis:
    
    Assignment Type: ${analysisResult.assignmentType}
    
    Topics: ${analysisResult.topics.join(", ")}
    
    Requirements:
    ${analysisResult.requirements.map(req => `- ${req}`).join("\n")}
    
    ${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}
    
    Custom Prompt: ${analysisResult.customPrompt}
    
    Create a detailed, well-structured draft that addresses all requirements.
    The draft should be original, properly formatted, and demonstrate critical thinking.
    If research or citations are needed, include proper citations.
    
    Format your response to be directly usable as an assignment submission.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    // Extract citations if present
    const citationPattern = /\[([^\]]+)\]/g;
    const citations = [];
    let match;
    
    while ((match = citationPattern.exec(content)) !== null) {
      citations.push(match[1]);
    }
    
    // Return the draft result
    return {
      content,
      citations: citations.length > 0 ? Array.from(new Set(citations)) : undefined,
      notes: "Generated using Google Gemini AI"
    };
  } catch (error) {
    console.error("Gemini draft generation error:", error);
    throw new Error("Failed to generate draft with Gemini");
  }
}

/**
 * Enhance existing content using Gemini AI
 */
export async function enhanceContentWithGemini(
  content: string,
  instructions: string
): Promise<string> {
  try {
    const model = getModel();
    
    // Build prompt for content enhancement
    const prompt = `
    Enhance the following content according to these instructions:
    
    Instructions: ${instructions}
    
    Original Content:
    ${content}
    
    Provide only the enhanced content without any explanations or additional text.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini content enhancement error:", error);
    throw new Error("Failed to enhance content with Gemini");
  }
}