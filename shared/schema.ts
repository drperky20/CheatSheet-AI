import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  canvasUrl: text("canvas_url"),
  canvasToken: text("canvas_token"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  canvasUrl: true,
  canvasToken: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  canvasUrl: z.string().optional(),
  canvasToken: z.string().optional(),
});

export const assignmentDrafts = pgTable("assignment_drafts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  assignmentId: integer("assignment_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  submitted: boolean("submitted").default(false),
});

export const insertAssignmentDraftSchema = createInsertSchema(assignmentDrafts).pick({
  userId: true,
  courseId: true,
  assignmentId: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  submitted: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAssignmentDraft = z.infer<typeof insertAssignmentDraftSchema>;
export type AssignmentDraft = typeof assignmentDrafts.$inferSelect;
