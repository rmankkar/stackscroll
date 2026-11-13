import { questions, bookmarks, type Question, type InsertQuestion, type Bookmark, type InsertBookmark } from "@shared/schema";
import { eq } from "drizzle-orm";
import { fetchStackOverflowQuestions, fetchStackOverflowAnswers } from "./stack-overflow";

export interface IStorage {
  getQuestions(page: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getBookmarks(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<void>;
  isBookmarked(userId: number, questionId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private questions: Map<number, Question>;
  private bookmarks: Map<number, Bookmark>;
  currentId: number;
  bookmarkId: number;

  constructor() {
    this.questions = new Map();
    this.bookmarks = new Map();
    this.currentId = 1;
    this.bookmarkId = 1;
  }

  async getQuestions(page: number): Promise<Question[]> {
    const pageSize = 10;

    try {
      const { questions: soQuestions, hasMore } = await fetchStackOverflowQuestions(page, pageSize);

      if (soQuestions.length === 0) return [];

      // Fetch answers for each question in parallel
      const answersByQuestionId = new Map<number, any[]>();
      await Promise.all(
        soQuestions.map(async (q) => {
          const answers = await fetchStackOverflowAnswers([q.question_id]);
          answersByQuestionId.set(q.question_id, answers);
        })
      );

      const results: Question[] = soQuestions.map((q) => ({
        id: this.currentId++,
        stackOverflowId: q.question_id,
        title: q.title,
        body: q.body,
        score: q.score,
        acceptedAnswerId: q.accepted_answer_id ?? null,
        authorName: q.owner.display_name || "Unknown",
        answers: answersByQuestionId
          .get(q.question_id)
          ?.map((a) => ({
            answer_id: a.answer_id,
            body: a.body,
            score: a.score,
            is_accepted: a.is_accepted,
            owner: { display_name: a.owner.display_name || "Unknown" },
          })) ?? [],
      }));

      // Store in memory for bookmarking and cross-page reference
      results.forEach((q) => {
        // Avoid duplicates if the same question was already cached
        const exists = Array.from(this.questions.values()).some(
          (existing) => existing.stackOverflowId === q.stackOverflowId
        );
        if (!exists) {
          this.questions.set(q.id, q);
        }
      });

      return results;
    } catch (error) {
      console.error("Failed to fetch from Stack Overflow API:", error);
      // Fall back to any cached questions
      return Array.from(this.questions.values())
        .sort((a, b) => b.score - a.score)
        .slice((page - 1) * pageSize, page * pageSize);
    }
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentId++;
    const question: Question = {
      ...insertQuestion,
      id,
      stackOverflowId: insertQuestion.stackOverflowId ?? null,
      acceptedAnswerId: insertQuestion.acceptedAnswerId ?? null,
    };
    this.questions.set(id, question);
    return question;
  }

  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter((b) => b.userId === userId);
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.bookmarkId++;
    const bookmark: Bookmark = { ...insertBookmark, id, createdAt: new Date() };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(id: number): Promise<void> {
    this.bookmarks.delete(id);
  }

  async isBookmarked(userId: number, questionId: number): Promise<boolean> {
    return Array.from(this.bookmarks.values()).some(
      (b) => b.userId === userId && b.questionId === questionId
    );
  }
}

export const storage = new MemStorage();
