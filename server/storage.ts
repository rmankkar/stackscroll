import { questions, bookmarks, type Question, type InsertQuestion, type Bookmark, type InsertBookmark } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  fetchStackOverflowQuestions,
  fetchStackOverflowSearch,
  fetchStackOverflowAnswers,
} from "./stack-overflow";

export interface IStorage {
  getQuestions(page: number, tag?: string): Promise<Question[]>;
  searchQuestions(query: string, page: number, tag?: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getBookmarks(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<void>;
  isBookmarked(userId: number, questionId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private questions: Map<number, Question>;
  private bookmarks: Map<number, Bookmark>;
  private searchCache: Map<string, { results: Question[]; fetchedAt: number }>;
  currentId: number;
  bookmarkId: number;

  private static readonly SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private static readonly MAX_SEARCH_CACHE_ENTRIES = 100;

  constructor() {
    this.questions = new Map();
    this.bookmarks = new Map();
    this.searchCache = new Map();
    this.currentId = 1;
    this.bookmarkId = 1;
  }

  async getQuestions(page: number, tag?: string): Promise<Question[]> {
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
        tags: q.tags ?? [],
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

      // Optional tag filter — narrows the current page to questions carrying the tag
      const filtered = tag ? results.filter((q) => q.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) : results;

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

      return filtered;
    } catch (error) {
      console.error("Failed to fetch from Stack Overflow API:", error);
      // Fall back to any cached questions
      const cached = Array.from(this.questions.values())
        .sort((a, b) => b.score - a.score)
        .slice((page - 1) * pageSize, page * pageSize);
      return tag ? cached.filter((q) => q.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) : cached;
    }
  }

  async searchQuestions(query: string, page: number, tag?: string): Promise<Question[]> {
    const pageSize = 10;
    const cacheKey = query.trim().toLowerCase();

    // Check client-side search cache first
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      if (Date.now() - cached.fetchedAt < MemStorage.SEARCH_CACHE_TTL) {
        return cached.results;
      }
      this.searchCache.delete(cacheKey);
    }

    try {
      const { questions: soQuestions, hasMore } = await fetchStackOverflowSearch(
        query,
        page,
        pageSize
      );

      if (soQuestions.length === 0) {
        this.setSearchCache(cacheKey, []);
        return [];
      }

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
        tags: q.tags ?? [],
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

      // Cache search results
      this.setSearchCache(cacheKey, results);

      const filtered = tag ? results.filter((q) => q.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) : results;
      return filtered;
    } catch (error) {
      console.error("Failed to search Stack Overflow API:", error);
      return [];
    }
  }

  private setSearchCache(key: string, results: Question[]): void {
    if (this.searchCache.size >= MemStorage.MAX_SEARCH_CACHE_ENTRIES) {
      const firstKey = this.searchCache.keys().next().value;
      if (firstKey !== undefined) this.searchCache.delete(firstKey);
    }
    this.searchCache.set(key, { results, fetchedAt: Date.now() });
  }

  async clearSearchCache(): Promise<void> {
    this.searchCache.clear();
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentId++;
    const question: Question = {
      ...insertQuestion,
      id,
      stackOverflowId: insertQuestion.stackOverflowId ?? null,
      acceptedAnswerId: insertQuestion.acceptedAnswerId ?? null,
      tags: Array.isArray(insertQuestion.tags) ? insertQuestion.tags : [],
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
