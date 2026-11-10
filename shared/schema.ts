import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  auth0Id: text("auth0_id").notNull().unique(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  stackOverflowId: integer("stackoverflow_id").unique(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  score: integer("score").notNull(),
  acceptedAnswerId: integer("accepted_answer_id"),
  authorName: text("author_name").notNull(),
  answers: jsonb("answers").notNull(),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  questionId: integer("question_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  auth0Id: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  stackOverflowId: true,
  title: true,
  body: true,
  score: true,
  acceptedAnswerId: true,
  authorName: true,
  answers: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).pick({
  userId: true,
  questionId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
