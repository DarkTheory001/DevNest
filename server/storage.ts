import {
  users,
  projects,
  transactions,
  chatMessages,
  whatsappBots,
  type User,
  type UpsertUser,
  type InsertProject,
  type Project,
  type InsertTransaction,
  type Transaction,
  type InsertChatMessage,
  type ChatMessage,
  type InsertWhatsappBot,
  type WhatsappBot,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getUserProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  updateUserBalance(userId: string, amount: number): Promise<User>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(limit?: number): Promise<(ChatMessage & { user: User })[]>;
  
  // WhatsApp Bot operations
  createWhatsappBot(bot: InsertWhatsappBot): Promise<WhatsappBot>;
  getProjectWhatsappBot(projectId: string): Promise<WhatsappBot | undefined>;
  updateWhatsappBot(id: string, updates: Partial<InsertWhatsappBot>): Promise<WhatsappBot>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    totalProjects: number;
    totalTransactions: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async updateUserBalance(userId: string, amount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        coinBalance: amount,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Chat operations
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getChatMessages(limit: number = 50): Promise<(ChatMessage & { user: User })[]> {
    return await db
      .select({
        id: chatMessages.id,
        userId: chatMessages.userId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        user: users,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // WhatsApp Bot operations
  async createWhatsappBot(bot: InsertWhatsappBot): Promise<WhatsappBot> {
    const [newBot] = await db
      .insert(whatsappBots)
      .values(bot)
      .returning();
    return newBot;
  }

  async getProjectWhatsappBot(projectId: string): Promise<WhatsappBot | undefined> {
    const [bot] = await db
      .select()
      .from(whatsappBots)
      .where(eq(whatsappBots.projectId, projectId));
    return bot;
  }

  async updateWhatsappBot(id: string, updates: Partial<InsertWhatsappBot>): Promise<WhatsappBot> {
    const [bot] = await db
      .update(whatsappBots)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(whatsappBots.id, id))
      .returning();
    return bot;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    totalProjects: number;
    totalTransactions: number;
  }> {
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    const [projectCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects);
    
    const [transactionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions);

    return {
      totalUsers: userCount.count,
      totalProjects: projectCount.count,
      totalTransactions: transactionCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
