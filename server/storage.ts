import { type ChatSession, type InsertChatSession, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Chat Sessions
  getChatSessions(): Promise<ChatSession[]>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  deleteChatSession(id: string): Promise<void>;
  deleteAllChatSessions(): Promise<void>;
  
  // Messages
  getMessagesBySessionId(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessagesBySessionId(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private chatSessions: Map<string, ChatSession>;
  private messages: Map<string, Message>;

  constructor() {
    this.chatSessions = new Map();
    this.messages = new Map();
  }

  async getChatSessions(): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const now = new Date();
    const session: ChatSession = {
      ...insertSession,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async deleteChatSession(id: string): Promise<void> {
    this.chatSessions.delete(id);
    // Also delete associated messages
    const messagesToDelete = Array.from(this.messages.entries())
      .filter(([_, message]) => message.sessionId === id)
      .map(([messageId]) => messageId);
    
    messagesToDelete.forEach(messageId => this.messages.delete(messageId));
  }

  async deleteAllChatSessions(): Promise<void> {
    this.chatSessions.clear();
    this.messages.clear();
  }

  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);

    // Update the session's updatedAt timestamp
    const session = this.chatSessions.get(insertMessage.sessionId);
    if (session) {
      const updatedSession = { ...session, updatedAt: new Date() };
      this.chatSessions.set(insertMessage.sessionId, updatedSession);
    }

    return message;
  }

  async deleteMessagesBySessionId(sessionId: string): Promise<void> {
    const messagesToDelete = Array.from(this.messages.entries())
      .filter(([_, message]) => message.sessionId === sessionId)
      .map(([messageId]) => messageId);
    
    messagesToDelete.forEach(messageId => this.messages.delete(messageId));
  }
}

export const storage = new MemStorage();
