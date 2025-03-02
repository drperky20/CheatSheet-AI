import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { AnalysisResult, DraftResult } from "./ai-service";

// Initialize the Gemini AI client
let apiKey: string | undefined = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI;

// Initialize client with current API key (if available)
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log("Gemini API client initialized with existing key from environment");
  } catch (error) {
    console.error("Failed to initialize Gemini client with environment key:", error);
  }
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
  if (!apiKey) {
    throw new Error("Gemini API key is not set. Please add your Google Gemini API key in settings.");
  }
  
  if (!genAI) {
    throw new Error("Gemini client not initialized. Please check your API key.");
  }
  
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-thinking-exp-01-21",
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
    
    Humanizing Instructions:
    First, create a base draft that addresses all requirements thoroughly and completely.
    
    Then, transform it using one of these personas:
    
    1. Middle School Student: Use informal text that attempts to be formal but doesn't quite get there. Include:
       - Occasional awkward phrasing and simplistic transitions ("Next," "Also," "In conclusion")
       - Some grammatical errors that a 12-14 year old might make
       - Enthusiasm about simple concepts ("This was really interesting to learn about!")
       - References to basic sources like textbooks or Wikipedia
       - High school level reasoning at best
    
    2. College Undergraduate: Write as a typical undergraduate student would:
       - Somewhat formal but still developing academic voice
       - Occasional complex terms used slightly incorrectly
       - Adequate but not exceptional critical analysis
       - Decent structure with clear introduction and conclusion
       - Citation of mostly mainstream academic sources
    
    3. Working Professional: Write as a 40-year-old with a 9th grade education level:
       - More mature in tone but still accessible
       - Straightforward language and clear structure
       - Practical examples from real-life experience
       - Avoidance of complex terminology unless explained
       - Occasional references to workplace applications
    
    For this draft, use persona #1 (Middle School Student) unless otherwise specified in additional instructions.
    
    Create a detailed, well-structured draft that addresses all requirements.
    The draft should be original, properly formatted, and demonstrate appropriate thinking for the selected persona.
    If research or citations are needed, include proper citations in a style matching the persona.
    
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