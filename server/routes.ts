import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get("/api/questions", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const questions = await storage.getQuestions(page);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  return httpServer;
}