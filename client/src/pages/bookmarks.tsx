import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark, Loader2 } from "lucide-react";
import QACard from "@/components/qa-card";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { type Question } from "@shared/schema";

export default function Bookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load bookmarked question IDs from localStorage
    const ids = new Set<number>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("bookmark_") && localStorage.getItem(key) === "true") {
        const qid = parseInt(key.replace("bookmark_", ""), 10);
        if (!isNaN(qid)) ids.add(qid);
      }
    }
    setBookmarkedIds(ids);
    setIsLoading(false);
  }, []);

  // Fetch all questions to filter by bookmarked IDs
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("/api/questions?page=1");
        const data = await response.json();
        const bookmarkedQuestions = (data as Question[]).filter(q =>
          bookmarkedIds.has(q.id)
        );
        setQuestions(bookmarkedQuestions);
      } catch {
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [bookmarkedIds]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center pt-20 sm:pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background overflow-hidden relative">
      <Header />

      <main className="relative z-10 h-full w-full overflow-y-auto pb-20 sm:pb-0 lg:pb-0">
        <div className="mx-auto w-full max-w-[500px] px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 pb-12 sm:pb-16 lg:pb-20">
            {/* Empty state */}
            {questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4 sm:mb-6 opacity-50">
                  <Bookmark className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">No bookmarks yet</h3>
                <p className="text-muted-foreground mt-2 sm:mt-3">
                  Bookmark questions you want to save for later.
                </p>
              </div>
            )}

            {questions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                <QACard question={question} />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
