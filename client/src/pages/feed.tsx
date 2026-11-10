import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import QACard from "@/components/qa-card";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { type Question } from "@shared/schema";

export default function Feed() {
  const [page, setPage] = useState(1);
  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions", page],
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center pt-20 sm:pt-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const visibleQuestions = questions?.slice(0, page * 10) || [];
  const hasMore = visibleQuestions.length < (questions?.length || 0);

  return (
    <div className="h-screen w-full bg-background overflow-hidden relative">
      <Header />

      <main className="relative z-10 h-full w-full overflow-y-auto pb-20 sm:pb-0 lg:pb-0">
        <div className="mx-auto w-full max-w-[500px] px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8 pb-12 sm:pb-16 lg:pb-20">
            {visibleQuestions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
              >
                <QACard question={question} />
              </motion.div>
            ))}

            {hasMore && (
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
