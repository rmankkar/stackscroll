import type { Express, Request, Response } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertQuestionSchema, insertBookmarkSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get("/api/questions", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const questions = await storage.getQuestions(page);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post("/api/questions", async (req: Request, res: Response) => {
    try {
      const validated = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(validated);
      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid question data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create question" });
      }
    }
  });

  app.get("/api/bookmarks", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const bookmarks = await storage.getBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post("/api/bookmarks", async (req: Request, res: Response) => {
    try {
      const validated = insertBookmarkSchema.parse(req.body);
      const bookmark = await storage.createBookmark(validated);
      res.status(201).json(bookmark);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bookmark data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bookmark" });
      }
    }
  });

  app.delete("/api/bookmarks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBookmark(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bookmark" });
    }
  });

  app.get("/api/bookmarks/check", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const questionId = parseInt(req.query.questionId as string);
      const isBookmarked = await storage.isBookmarked(userId, questionId);
      res.json({ isBookmarked });
    } catch (error) {
      res.status(500).json({ message: "Failed to check bookmark status" });
    }
  });

  return httpServer;
}
