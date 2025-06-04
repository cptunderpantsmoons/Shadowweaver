import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebSockets } from "./websocket";
import { initDeepSeek } from "./deepseek";
import { setupTools } from "./tools";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Initialize DeepSeek API
  initDeepSeek();

  // Initialize security tools
  setupTools();

  // Setup WebSockets
  setupWebSockets(httpServer);

  // Chat API endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      const result = await storage.createEvent({
        user_input: message,
        ai_response: '',
        task_output: '',
        attack_plan: {}
      });

      // For immediate response, return the event ID
      // The actual AI processing will happen via WebSocket
      res.json({ 
        status: 'processing',
        eventId: result.id
      });
    } catch (error) {
      console.error('Error in chat API:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get history API endpoint
  app.get('/api/history', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error('Error getting history:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get tools API endpoint
  app.get('/api/tools', async (req, res) => {
    try {
      const tools = await storage.getTools();
      res.json(tools);
    } catch (error) {
      console.error('Error getting tools:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get exploits API endpoint
  app.get('/api/exploits', async (req, res) => {
    try {
      const exploits = await storage.getExploits();
      res.json(exploits);
    } catch (error) {
      console.error('Error getting exploits:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get target info API endpoint
  app.get('/api/targets/:ip', async (req, res) => {
    try {
      const target = await storage.getTargetByIp(req.params.ip);
      if (!target) {
        return res.status(404).json({ message: 'Target not found' });
      }
      res.json(target);
    } catch (error) {
      console.error('Error getting target info:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return httpServer;
}
