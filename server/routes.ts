import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";

// Canvas API Routes
import {
  getCourses,
  getCourseAssignments,
  getAssignmentDetails,
  submitAssignment,
  analyzeExternalLink
} from "./canvas-api";

// AI Service Routes
import {
  analyzeAssignment,
  generateDraft,
  enhanceContent
} from "./ai-service";

// Import Google Generative AI SDK
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Gemini AI Service
import {
  setGeminiApiKey,
  analyzeAssignmentWithGemini,
  generateDraftWithGemini,
  enhanceContentWithGemini
} from "./gemini-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Error handling middleware for Zod validation errors
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err && typeof err.name === 'string' && err.name === 'ZodError') {
      return res.status(400).json({ message: fromZodError(err).message });
    }
    next(err);
  });

  // Canvas API Routes
  app.get("/api/canvas/courses", ensureAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as Express.User;
      const courses = await getCourses(user.canvasUrl || undefined, user.canvasToken || undefined);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/canvas/courses/:courseId/assignments", ensureAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as Express.User;
      const courseId = parseInt(req.params.courseId);
      const assignments = await getCourseAssignments(user.canvasUrl || undefined, user.canvasToken || undefined, courseId);
      res.json(assignments);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/canvas/courses/:courseId/assignments/:assignmentId", ensureAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as Express.User;
      const courseId = parseInt(req.params.courseId);
      const assignmentId = parseInt(req.params.assignmentId);
      const assignment = await getAssignmentDetails(user.canvasUrl || undefined, user.canvasToken || undefined, courseId, assignmentId);
      res.json(assignment);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/canvas/courses/:courseId/assignments/:assignmentId/submit", ensureAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as Express.User;
      const courseId = parseInt(req.params.courseId);
      const assignmentId = parseInt(req.params.assignmentId);
      
      const submissionSchema = z.object({
        assignmentId: z.number(),
        body: z.string(),
        submittedAt: z.string().datetime(),
        file: z.any().optional()
      });
      
      const validatedData = submissionSchema.parse(req.body);
      const result = await submitAssignment(
        user.canvasUrl || undefined, 
        user.canvasToken || undefined, 
        courseId, 
        assignmentId, 
        validatedData
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/canvas/analyze-link", ensureAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as Express.User;
      
      const schema = z.object({
        url: z.string().url()
      });
      
      const { url } = schema.parse(req.body);
      const result = await analyzeExternalLink(user.canvasUrl || undefined, user.canvasToken || undefined, url);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // AI Service Routes
  app.post("/api/ai/analyze-assignment", ensureAuthenticated, async (req, res, next) => {
    try {
      const schema = z.object({
        assignmentDetails: z.string(),
        externalContent: z.string().optional()
      });
      
      const { assignmentDetails, externalContent } = schema.parse(req.body);
      const result = await analyzeAssignment(assignmentDetails, externalContent);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/ai/generate-draft", ensureAuthenticated, async (req, res, next) => {
    try {
      const schema = z.object({
        assignmentDetails: z.string(),
        analysisResult: z.object({
          assignmentType: z.string(),
          topics: z.array(z.string()),
          requirements: z.array(z.string()),
          suggestedApproach: z.string(),
          externalLinks: z.array(z.string()),
          customPrompt: z.string()
        }),
        externalContent: z.string().optional()
      });
      
      const { assignmentDetails, analysisResult, externalContent } = schema.parse(req.body);
      const result = await generateDraft(assignmentDetails, analysisResult, externalContent);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/ai/enhance-content", ensureAuthenticated, async (req, res, next) => {
    try {
      const schema = z.object({
        content: z.string(),
        instruction: z.string()
      });
      
      const { content, instruction } = schema.parse(req.body);
      const enhancedContent = await enhanceContent(content, instruction);
      
      res.json({ content: enhancedContent });
    } catch (error) {
      next(error);
    }
  });
  
  // Gemini API Routes
  app.post("/api/gemini/set-api-key", ensureAuthenticated, (req, res, next) => {
    try {
      const schema = z.object({
        apiKey: z.string().min(1, "API key cannot be empty")
      });
      
      const { apiKey } = schema.parse(req.body);
      setGeminiApiKey(apiKey);
      
      // Save the API key in the environment for persistence
      process.env.GEMINI_API_KEY = apiKey;
      
      res.json({ success: true, message: "Gemini API key updated successfully" });
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/gemini/check-api-key", ensureAuthenticated, (req, res) => {
    // Always return that the API key is set (using developer's key)
    res.json({ 
      isSet: true,
      provider: "Google Gemini"
    });
  });
  
  app.post("/api/gemini/test-api-key", ensureAuthenticated, async (req, res, next) => {
    try {
      const schema = z.object({
        apiKey: z.string().min(1, "API key cannot be empty")
      });
      
      const { apiKey } = schema.parse(req.body);
      
      try {
        // Create a temporary Gemini client with the provided key
        const tempGenAI = new GoogleGenerativeAI(apiKey);
        const model = tempGenAI.getGenerativeModel({ 
          model: "gemini-1.5-pro",
          safetySettings: [
            {
              category: HarmCategory.HARM_CATEGORY_HARASSMENT,
              threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }
          ]
        });
        
        // Make a simple request to test the API key
        const testPrompt = "Hello, this is a test message to verify that the API key is working.";
        
        const result = await model.generateContent(testPrompt);
        const response = await result.response;
        
        if (response && response.text()) {
          res.json({ 
            success: true, 
            message: "Gemini API key is valid" 
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Invalid Gemini API key or unexpected response"
          });
        }
      } catch (err) {
        console.error("Error testing Gemini API key:", err);
        let errorMessage = "Invalid Gemini API key";
        
        if (err instanceof Error) {
          errorMessage = `Invalid Gemini API key: ${err.message}`;
        }
        
        res.status(400).json({ 
          success: false, 
          message: errorMessage
        });
      }
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/gemini/analyze-assignment", ensureAuthenticated, async (req, res, next) => {
    try {
      const schema = z.object({
        assignmentDetails: z.string(),
        externalContent: z.string().optional()
      });
      
      const { assignmentDetails, externalContent } = schema.parse(req.body);
      const result = await analyzeAssignmentWithGemini(assignmentDetails, externalContent);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/gemini/generate-draft", ensureAuthenticated, async (req, res, next) => {
    try {
      const schema = z.object({
        analysisResult: z.object({
          assignmentType: z.string(),
          topics: z.array(z.string()),
          requirements: z.array(z.string()),
          suggestedApproach: z.string(),
          externalLinks: z.array(z.string()),
          customPrompt: z.string()
        }),
        additionalInstructions: z.string().optional()
      });
      
      const { analysisResult, additionalInstructions } = schema.parse(req.body);
      const result = await generateDraftWithGemini(analysisResult, additionalInstructions);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/gemini/enhance-content", ensureAuthenticated, async (req, res, next) => {
    try {
      const schema = z.object({
        content: z.string(),
        instructions: z.string()
      });
      
      const { content, instructions } = schema.parse(req.body);
      const enhancedContent = await enhanceContentWithGemini(content, instructions);
      
      res.json({ content: enhancedContent });
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
