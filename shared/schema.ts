import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  coinBalance: integer("coin_balance").default(100),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectTypeEnum = pgEnum("project_type", [
  "web_app",
  "whatsapp_bot", 
  "api",
  "static_site"
]);

export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "inactive", 
  "building",
  "error"
]);

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  type: projectTypeEnum("type").notNull(),
  status: projectStatusEnum("status").default("inactive"),
  repositoryUrl: varchar("repository_url"),
  deploymentUrl: varchar("deployment_url"),
  webhookSecret: varchar("webhook_secret"),
  envVariables: jsonb("env_variables").default({}),
  files: jsonb("files").default({}),
  lastDeployed: timestamp("last_deployed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactionTypeEnum = pgEnum("transaction_type", [
  "admin_grant",
  "project_deployment",
  "resource_usage",
  "bonus"
]);

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  adminId: varchar("admin_id").references(() => users.id),
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const whatsappBots = pgTable("whatsapp_bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phoneNumber: varchar("phone_number"),
  accessToken: varchar("access_token"),
  webhookUrl: varchar("webhook_url"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  transactions: many(transactions),
  chatMessages: many(chatMessages),
  adminTransactions: many(transactions, { relationName: "adminTransactions" }),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  whatsappBot: one(whatsappBots),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  admin: one(users, {
    fields: [transactions.adminId],
    references: [users.id],
    relationName: "adminTransactions",
  }),
}));

export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const whatsappBotRelations = relations(whatsappBots, ({ one }) => ({
  project: one(projects, {
    fields: [whatsappBots.projectId],
    references: [projects.id],
  }),
}));

// Schemas for validation
export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertWhatsappBotSchema = createInsertSchema(whatsappBots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertWhatsappBot = z.infer<typeof insertWhatsappBotSchema>;
export type WhatsappBot = typeof whatsappBots.$inferSelect;
