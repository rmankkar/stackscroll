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
  const isMobile = window.innerWidth < 768;

  return (
    <div className="h-screen w-full overflow-hidden bg-background relative">
      <BackgroundBlobs />

      {/* Top bar — app name centered, profile on right */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent-glow))] animate-pulse-soft" />
            <span className="text-xs sm:text-sm font-medium text-foreground tracking-tight">
              StackScroll
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="glass w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-accent/10 text-accent-foreground shrink-0"
          onClick={() => setLocation("/profile")}
        >
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      <main className="relative z-10 h-full w-full pt-16 sm:pt-20 lg:pt-24">
        <AnimatePresence>
          <motion.div
            {...bind()}
            style={{
              transform: y.to((py) => `translateY(${py}px)`),
            }}
            className="h-full w-full touch-none flex items-center justify-center px-4 sm:px-6 lg:px-12"
          >
            {question && (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="relative h-full w-full sm:w-[500px] touch-none"
              >
                <QACard question={question} />

                {/* Page indicator */}
                {questions && questions.length > 0 && (
                  <div className="mt-6 sm:mt-8 flex w-full justify-center gap-2 sm:gap-3 px-4 sm:px-6">
                    {Array.from({ length: Math.min(questions.length, 5) }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === page - 1
                            ? "w-8 sm:w-12 bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_hsl(var(--primary-glow))]"
                            : "w-2.5 sm:w-2.5 bg-border/50"
                        }`}
                      />
                    ))}
                    {hasMore && (
                      <div className="h-1.5 w-2.5 sm:w-2.5 rounded-full bg-border/50 animate-pulse-soft" />
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Swipe hint (mobile only) */}
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 sm:hidden">
          <div className="w-3 h-0.5 bg-border/50 rounded-full" />
          <p className="text-[10px] text-muted-foreground/70 tracking-widest uppercase">
            swipe to browse
          </p>
        </div>

        {/* Mobile bottom action bar */}
        {question && isMobile && (
          <div className="absolute bottom-[10%] left-0 right-0 z-20 px-5 flex justify-between">
            <BookmarkButton questionId={question.id} className="w-10 h-10 rounded-2xl" />
            <ShareButton question={question} className="w-10 h-10 rounded-2xl" />
          </div>
        )}
      </main>

      {/* Bottom action bar (desktop only) */}
      {question && !isMobile && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4">
          <BookmarkButton questionId={question.id} className="w-11 h-11 rounded-2xl" />
          <ShareButton question={question} className="w-11 h-11 rounded-2xl" />
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

function BookmarkButton({
  questionId,
  className,
}: { questionId: number; className?: string }) {
  const [saved, setSaved] = useState(false);
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "glass shadow-lg hover:bg-accent/10 hover:-translate-y-0.5 transition-all",
        className
      )}
      onClick={() => setSaved(!saved)}
    >
      <Bookmark
        className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
          saved ? "text-accent-foreground" : "text-muted-foreground"
        }`}
      />
    </Button>
  );
}

function ShareButton({
  question,
  className,
}: { question: Question; className?: string }) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "glass shadow-lg hover:bg-primary/10 hover:-translate-y-0.5 transition-all",
        className
      )}
      onClick={() => {
        if (typeof navigator?.share === "function") {
          navigator.share({
            title: question.title,
            url: window.location.origin,
          });
        }
      }}
    >
      <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
    </Button>
  );
}
