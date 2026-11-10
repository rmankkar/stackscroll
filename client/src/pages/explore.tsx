import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import QACard from "@/components/qa-card";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { type Question } from "@shared/schema";

export default function Explore() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions", page],
  });

  const visibleQuestions = questions?.slice(0, page * 10) || [];
  const filtered = search
    ? visibleQuestions.filter(q =>
        q.title.toLowerCase().includes(search.toLowerCase())
      )
    : visibleQuestions;
  const hasMore = visibleQuestions.length < (questions?.length || 0);

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
            {/* Search bar */}
            <div className="relative mb-4 sm:mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-white/30 bg-white/50 text-foreground placeholder-text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 sm:mb-6">
                  <Loader2 className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">No questions found</h3>
                <p className="text-muted-foreground mt-2 sm:mt-3">
                  {search ? "Try adjusting your search terms." : "Be the first to ask a question."}
                </p>
              </div>
            ) : (
              filtered.map((question) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                >
                  <QACard question={question} />
                </motion.div>
              ))
            )}

            {hasMore && !search && (
              <div className="flex items-center justify-center gap-2 py-4 sm:py-6">
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                <span className="text-sm text-muted-foreground">Loading more...</span>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
