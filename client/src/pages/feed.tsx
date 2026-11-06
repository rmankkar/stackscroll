import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import QACard from "@/components/qa-card";
import LoadingCard from "@/components/loading-card";
import BackgroundBlobs from "@/components/background-blobs";
import { type Question } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User, Bookmark, Share2 } from "lucide-react";

export default function Feed() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions", page],
  });

  const [{ y }, api] = useSpring(() => ({ y: 0 }));

  const bind = useDrag(
    ({ down, movement: [_, my], velocity }) => {
      api.start({ y: down ? my : 0, immediate: down });

      if (!down && (Math.abs(my) > 100 || Math.abs(velocity) > 0.5)) {
        const shouldSwipeUp = my < 0 || velocity < -0.5;
        if (shouldSwipeUp && questions?.[page]) {
          setPage((p) => p + 1);
        } else if (!shouldSwipeUp && page > 1) {
          setPage((p) => p - 1);
        }
      }
    },
    {
      axis: "y",
      filterTaps: true,
      swipe: { velocity: 0.1 },
    }
  );

  if (isLoading) {
    return <LoadingCard />;
  }

  const question = questions?.[page - 1];
  const hasMore = Boolean(questions?.[page]);

  return (
    <div className="h-screen w-full overflow-hidden bg-background relative">
      <BackgroundBlobs />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4 sm:px-7 sm:py-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent-glow))] animate-pulse-soft" />
          <span className="text-sm font-medium text-foreground tracking-tight text-balance">
            StackScroll
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="glass w-10 h-10 rounded-full hover:bg-accent/10 text-accent-foreground"
          onClick={() => setLocation("/profile")}
        >
          <User className="h-5 w-5" />
        </Button>
      </div>

      <main className="relative z-10 h-full w-full">
        <AnimatePresence>
          <motion.div
            {...bind()}
            style={{
              transform: y.to((py) => `translateY(${py}px)`),
            }}
            className="h-full w-full touch-none flex items-center justify-center px-3 sm:px-6"
          >
            {question && (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="w-full max-w-md sm:max-w-lg touch-none"
              >
                <QACard question={question} />

                {/* Page indicator */}
                {questions && questions.length > 0 && (
                  <div className="mt-6 flex w-full justify-center gap-2 px-4 sm:px-6">
                    {Array.from({ length: Math.min(questions.length, 5) }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === page - 1
                            ? "w-8 bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_hsl(var(--primary-glow))]"
                            : "bg-border/50"
                        }`}
                      />
                    ))}
                    {hasMore && (
                      <div className="w-2 h-2 rounded-full bg-border/50 animate-pulse-soft" />
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint (mobile only) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 sm:hidden">
          <div className="w-3 h-0.5 bg-border/50 rounded-full" />
          <p className="text-[10px] text-muted-foreground/70 tracking-widest uppercase">
            swipe to browse
          </p>
        </div>
      </main>

      {/* Bottom action bar (desktop / wider screens) */}
      {question && window.innerWidth >= 768 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          <BookmarkButton questionId={question.id} />
          <ShareButton question={question} />
        </div>
      )}
    </div>
  );
}

function BookmarkButton({ questionId }: { questionId: number }) {
  const [saved, setSaved] = useState(false);
  return (
    <Button
      variant="outline"
      size="icon"
      className="glass w-11 h-11 rounded-2xl shadow-lg hover:bg-accent/10 hover:-translate-y-1 transition-all"
      onClick={() => setSaved(!saved)}
    >
      <Bookmark className={`h-5 w-5 transition-colors ${saved ? "text-accent-foreground" : "text-muted-foreground"}`} />
    </Button>
  );
}

function ShareButton({ question }: { question: Question }) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="glass w-11 h-11 rounded-2xl shadow-lg hover:bg-primary/10 hover:-translate-y-1 transition-all"
      onClick={() => {
        if (typeof navigator?.share === "function") {
          navigator.share({
            title: question.title,
            url: window.location.origin,
          });
        }
      }}
    >
      <Share2 className="h-5 w-5 text-muted-foreground" />
    </Button>
  );
}
