import { users, type User, type InsertUser, assignmentDrafts, type AssignmentDraft, type InsertAssignmentDraft } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  getDraft(id: number): Promise<AssignmentDraft | undefined>;
  getDraftByAssignment(userId: number, courseId: number, assignmentId: number): Promise<AssignmentDraft | undefined>;
  createDraft(draft: InsertAssignmentDraft): Promise<AssignmentDraft>;
  updateDraft(id: number, data: Partial<InsertAssignmentDraft>): Promise<AssignmentDraft | undefined>;
  getDraftsByUser(userId: number): Promise<AssignmentDraft[]>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private drafts: Map<number, AssignmentDraft>;
  currentUserId: number;
  currentDraftId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.drafts = new Map();
    this.currentUserId = 1;
    this.currentDraftId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      canvasUrl: insertUser.canvasUrl || null,
      canvasToken: insertUser.canvasToken || null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getDraft(id: number): Promise<AssignmentDraft | undefined> {
    return this.drafts.get(id);
  }
  
  async getDraftByAssignment(userId: number, courseId: number, assignmentId: number): Promise<AssignmentDraft | undefined> {
    return Array.from(this.drafts.values()).find(
      (draft) => draft.userId === userId && draft.courseId === courseId && draft.assignmentId === assignmentId,
    );
  }
  
  async createDraft(insertDraft: InsertAssignmentDraft): Promise<AssignmentDraft> {
    const id = this.currentDraftId++;
    const draft: AssignmentDraft = { ...insertDraft, id };
    this.drafts.set(id, draft);
    return draft;
  }
  
  async updateDraft(id: number, data: Partial<InsertAssignmentDraft>): Promise<AssignmentDraft | undefined> {
    const draft = await this.getDraft(id);
    if (!draft) return undefined;
    
    const updatedDraft = { ...draft, ...data };
    this.drafts.set(id, updatedDraft);
    return updatedDraft;
  }
  
  async getDraftsByUser(userId: number): Promise<AssignmentDraft[]> {
    return Array.from(this.drafts.values()).filter(
      (draft) => draft.userId === userId,
    );
  }
}

export const storage = new MemStorage();
