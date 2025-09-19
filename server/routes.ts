import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getUserRepositories, getRepositoryContent, createRepository } from "./githubClient";
import { 
  insertProjectSchema, 
  insertTransactionSchema, 
  insertChatMessageSchema,
  insertWhatsappBotSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getUserProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({ ...req.body, userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.patch('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = req.body;
      const project = await storage.updateProject(req.params.id, updates);
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // GitHub integration routes
  app.get('/api/github/repos', isAuthenticated, async (req, res) => {
    try {
      const repos = await getUserRepositories();
      res.json(repos);
    } catch (error) {
      console.error("Error fetching GitHub repos:", error);
      res.status(500).json({ message: "Failed to fetch GitHub repositories" });
    }
  });

  app.get('/api/github/repos/:owner/:repo/contents', isAuthenticated, async (req, res) => {
    try {
      const { owner, repo } = req.params;
      const path = req.query.path as string;
      const content = await getRepositoryContent(owner, repo, path);
      res.json(content);
    } catch (error) {
      console.error("Error fetching repository content:", error);
      res.status(500).json({ message: "Failed to fetch repository content" });
    }
  });

  app.post('/api/github/repos', isAuthenticated, async (req, res) => {
    try {
      const { name, description, isPrivate } = req.body;
      const repo = await createRepository(name, description, isPrivate);
      res.json(repo);
    } catch (error) {
      console.error("Error creating GitHub repo:", error);
      res.status(500).json({ message: "Failed to create GitHub repository" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const transactionData = insertTransactionSchema.parse({ ...req.body, adminId });
      const transaction = await storage.createTransaction(transactionData);
      
      // Update user balance
      const user = await storage.getUser(transaction.userId);
      if (user) {
        const newBalance = user.coinBalance + transaction.amount;
        await storage.updateUserBalance(transaction.userId, newBalance);
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  // Chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // WhatsApp Bot routes
  app.post('/api/whatsapp-bots', isAuthenticated, async (req, res) => {
    try {
      const botData = insertWhatsappBotSchema.parse(req.body);
      const bot = await storage.createWhatsappBot(botData);
      res.json(bot);
    } catch (error) {
      console.error("Error creating WhatsApp bot:", error);
      res.status(400).json({ message: "Failed to create WhatsApp bot" });
    }
  });

  app.get('/api/whatsapp-bots/project/:projectId', isAuthenticated, async (req, res) => {
    try {
      const bot = await storage.getProjectWhatsappBot(req.params.projectId);
      res.json(bot);
    } catch (error) {
      console.error("Error fetching WhatsApp bot:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp bot" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.claims.sub;
      const adminUser = await storage.getUser(adminId);
      
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'chat_message') {
          const messageData = insertChatMessageSchema.parse({
            userId: data.userId,
            message: data.message
          });
          
          const newMessage = await storage.createChatMessage(messageData);
          const user = await storage.getUser(data.userId);
          
          // Broadcast to all connected clients
          const messageWithUser = {
            ...newMessage,
            user,
            type: 'new_message'
          };
          
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(messageWithUser));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
