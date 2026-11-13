import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import QACard from "@/components/qa-card";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { type Question } from "@shared/schema";

export default function Feed() {
  const [page, setPage] = useState(1);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
            setIsLoadingMore(true);
            setPage((p) => p + 1);
          }
        },
        { threshold: 1.0 }
      );
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/questions?page=${page}`);
        const data = await res.json();

        if (data.length === 0) {
          setHasMore(false);
          return;
        }

        setAllQuestions((prev) => [...prev, ...data]);
      } catch {
        // Fetch failed — page will be retried on next scroll
      } finally {
        setIsLoadingMore(false);
        setInitialLoading(false);
      }
    };

    fetchQuestions();
  }, [page]);

  if (initialLoading && allQuestions.length === 0) {
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
            {allQuestions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                <QACard question={question} />
              </motion.div>
            ))}

            <div ref={observerRef} className="h-20">
              {isLoadingMore && (
                <div className="flex items-center justify-center gap-2 py-4 sm:py-6">
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading more…</span>
                </div>
              )}
              {!hasMore && allQuestions.length > 0 && (
                <div className="flex items-center justify-center py-4 sm:py-6">
                  <span className="text-sm text-muted-foreground">No more questions</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
