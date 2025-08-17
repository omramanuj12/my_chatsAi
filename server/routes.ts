import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendMessageSchema, insertChatSessionSchema } from "@shared/schema";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all chat sessions
  app.get("/api/chat/sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  // Get messages for a specific session
  app.get("/api/chat/sessions/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message and get AI response
  app.post("/api/chat/send", async (req, res) => {
    try {
      const result = sendMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request data", errors: result.error.errors });
      }

      const { sessionId, message, apiKey } = result.data;

      // Create OpenAI client with user's API key
      const openai = new OpenAI({ apiKey });

      let currentSessionId = sessionId;

      // Create new session if none provided
      if (!currentSessionId) {
        const newSession = await storage.createChatSession({
          title: message.length > 50 ? message.substring(0, 50) + "..." : message,
        });
        currentSessionId = newSession.id;
      }

      // Save user message
      const userMessage = await storage.createMessage({
        sessionId: currentSessionId,
        role: "user",
        content: message,
      });

      // Get conversation history for context
      const conversationHistory = await storage.getMessagesBySessionId(currentSessionId);
      
      // Prepare messages for OpenAI (excluding the just-added user message since we'll add it separately)
      const previousMessages = conversationHistory
        .slice(0, -1) // Remove the last message (the one we just added)
        .map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));

      // Add the current user message
      const messages = [
        ...previousMessages,
        { role: "user" as const, content: message }
      ];

      // Get AI response
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        throw new Error("No response from AI");
      }

      // Save AI message
      const assistantMessage = await storage.createMessage({
        sessionId: currentSessionId,
        role: "assistant",
        content: aiResponse,
      });

      res.json({
        sessionId: currentSessionId,
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          timestamp: userMessage.timestamp.toISOString(),
        },
        assistantMessage: {
          id: assistantMessage.id,
          content: assistantMessage.content,
          timestamp: assistantMessage.timestamp.toISOString(),
        },
      });

    } catch (error: any) {
      console.error("Error in chat send:", error);
      
      // Handle specific OpenAI errors
      if (error.status === 401) {
        return res.status(401).json({ message: "Invalid API key" });
      } else if (error.status === 429) {
        return res.status(429).json({ message: "Rate limit exceeded" });
      } else if (error.status === 402) {
        return res.status(402).json({ message: "Insufficient credits" });
      }
      
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Test API key
  app.post("/api/chat/test-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        return res.status(400).json({ message: "API key is required" });
      }

      const openai = new OpenAI({ apiKey });
      
      // Make a simple test request
      await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 1,
      });

      res.json({ valid: true });
    } catch (error: any) {
      console.error("API key test error:", error);
      if (error.status === 401) {
        return res.status(401).json({ valid: false, message: "Invalid API key" });
      }
      res.status(500).json({ valid: false, message: "Failed to test API key" });
    }
  });

  // Create new chat session
  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const result = insertChatSessionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid session data", errors: result.error.errors });
      }

      const session = await storage.createChatSession(result.data);
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  // Delete chat session
  app.delete("/api/chat/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.deleteChatSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting chat session:", error);
      res.status(500).json({ message: "Failed to delete chat session" });
    }
  });

  // Clear all chat history
  app.delete("/api/chat/sessions", async (req, res) => {
    try {
      await storage.deleteAllChatSessions();
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing chat history:", error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });

  // Clear messages in current session
  app.delete("/api/chat/sessions/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.deleteMessagesBySessionId(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing session messages:", error);
      res.status(500).json({ message: "Failed to clear session messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
