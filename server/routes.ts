import type { Express } from "express";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Error handling middleware for Zod validation errors
  app.use((err: any, _req: any, res: any, next: any) => {
    if (err && typeof err.name === 'string' && err.name === 'ZodError') {
      return res.status(400).json({ message: fromZodError(err).message });
    }
    next(err);
  });

  // Canvas API Routes
  app.get("/api/canvas/courses", ensureAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as Express.User;
      const courses = await getCourses(user.canvasUrl, user.canvasToken);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/canvas/courses/:courseId/assignments", ensureAuthenticated, async (req, res, next) => {
    try {
      const user = req.user as Express.User;
      const courseId = parseInt(req.params.courseId);
      const assignments = await getCourseAssignments(user.canvasUrl, user.canvasToken, courseId);
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
      const assignment = await getAssignmentDetails(user.canvasUrl, user.canvasToken, courseId, assignmentId);
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
        user.canvasUrl, 
        user.canvasToken, 
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
      const result = await analyzeExternalLink(user.canvasUrl, user.canvasToken, url);
      
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

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
