import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// API request/response schemas
export const sendMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1).max(4000),
  apiKey: z.string().min(1),
  provider: z.enum(["openai", "deepseek"]).default("openai"),
});

export const chatResponseSchema = z.object({
  sessionId: z.string(),
  userMessage: z.object({
    id: z.string(),
    content: z.string(),
    timestamp: z.string(),
  }),
  assistantMessage: z.object({
    id: z.string(),
    content: z.string(),
    timestamp: z.string(),
  }),
});

export type SendMessageRequest = z.infer<typeof sendMessageSchema>;
export type ChatResponse = z.infer<typeof chatResponseSchema>;
