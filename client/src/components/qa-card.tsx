import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowBigUp,
  Bookmark as BookmarkIcon,
  Copy,
  MessageCircle,
  Speaker,
  Share2,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
} from "lucide-react";
import { type Question } from "@shared/schema";
import { cn } from "@/lib/utils";
import AnswerComposer from "@/components/answer-composer";

const CATEGORY_COLORS = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  "bg-rose-500/10 text-rose-500 border-rose-500/20",
  "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  "bg-purple-500/10 text-purple-500 border-purple-500/20",
];

function categoryColor(index: number) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

interface QACardProps {
  question: Question;
  index?: number;
  isActive?: boolean;
}

export default function QACard({ question, index, isActive = true }: QACardProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [currentScore, setCurrentScore] = useState(question.score);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [answerText, setAnswerText] = useState("");

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const answers = Array.isArray(question.answers) ? question.answers : [];
  const categoryColorClass = categoryColor(question.id);

  useEffect(() => {
    const saved = localStorage.getItem(`bookmark_${question.id}`);
    setBookmarked(saved === "true");
  }, [question.id]);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const speak = useCallback(() => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const text = `${question.title}. ${question.body.replace(/<[^>]*>/g, " ")}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [question.title, question.body]);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
  }, []);

  const handleUpvote = () => {
    setUpvoted((prev) => {
      const next = !prev;
      setCurrentScore((s) => (prev ? s - 1 : s + 1));
      return next;
    });
  };

  const handleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    localStorage.setItem(`bookmark_${question.id}`, String(next));
  };

  const handleShare = async () => {
    try {
      if (typeof navigator?.share === "function") {
        await navigator.share({
          title: question.title,
          text: question.body.replace(/<[^>]*>/g, " ").slice(0, 200),
          url: window.location.origin,
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
      }
    } catch {
      // Share cancelled or failed
    }
  };

  const handleAnswerSubmit = (text: string) => {
    setAnswerText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="relative h-full w-full flex flex-col"
    >
      {/* Main question content — left/center */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-6 sm:pb-8">
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-white ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base font-bold">
                {question.authorName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-base font-semibold leading-none">
                {question.authorName}
              </CardTitle>
              <span className="text-[10px] sm:text-xs text-muted-foreground tracking-wide uppercase">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium border", categoryColorClass)}>
            Stack Overflow
          </span>
        </div>

        <h2 className={cn("text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-snug mb-5 sm:mb-7 text-balance")}>
          {question.title}
        </h2>

        <div
          className="prose prose-sm sm:prose-base lg:prose-lg text-muted-foreground/90 leading-relaxed mb-8 sm:mb-10 overflow-x-auto break-words"
          dangerouslySetInnerHTML={{ __html: question.body }}
        />

        {/* Bottom action row — all icons horizontal on both mobile and desktop */}
        <div className="flex items-center justify-between gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-white/10">
          {/* Left: Upvote + score */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant={upvoted ? "default" : "outline"}
              size="icon"
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-200",
                upvoted
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "border-white/30 text-foreground/80 hover:bg-primary/5 hover:text-primary",
              )}
              onClick={handleUpvote}
            >
              <ArrowBigUp className={cn("h-5 w-5 sm:h-6 sm:w-6", upvoted && "translate-y-[-1px]")} />
              <span className="sr-only">Upvote</span>
            </Button>
            <span className={cn(
              "text-xs sm:text-sm font-semibold",
              upvoted ? "text-primary" : "text-muted-foreground"
            )}>
              {currentScore}
            </span>
          </div>

          {/* Right: Answer, Hear, Bookmark, Share */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-200",
                "border-white/30 text-foreground/80 hover:bg-primary/5 hover:text-primary",
              )}
              onClick={() => setShowAnswers(!showAnswers)}
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-200",
                "border-white/30 text-foreground/80 hover:bg-primary/5 hover:text-primary",
              )}
              onClick={isSpeaking ? stopSpeaking : speak}
            >
              {isSpeaking ? (
                <VolumeX className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              ) : (
                <Speaker className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-200",
                bookmarked
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-white/30 text-foreground/80 hover:bg-primary/5 hover:text-primary",
              )}
              onClick={handleBookmark}
            >
              <BookmarkIcon
                className={cn("h-5 w-5 sm:h-6 sm:w-6", bookmarked && "fill-primary-foreground")}
                fill={bookmarked ? "currentColor" : "none"}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-200",
                "border-white/30 text-foreground/80 hover:bg-primary/5 hover:text-primary",
              )}
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Answers section */}
      <AnimatePresence mode="wait">
        {showAnswers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 space-y-3 sm:space-y-4"
          >
            {answers.map((answer: any) => (
              <Card
                key={answer.answer_id}
                className={cn(
                  "rounded-xl border-white/10 bg-secondary/50",
                  answer.is_accepted && "border-primary/30 bg-primary/5"
                )}
              >
                <CardContent className="p-3 sm:p-4 space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {answer.is_accepted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Accepted
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-semibold text-foreground">
                      {answer.owner?.display_name || "Anonymous"}
                    </span>
                  </div>
                  <div
                    className="prose prose-xs sm:prose-sm lg:prose-base text-muted-foreground/90 leading-relaxed overflow-x-auto break-words"
                    dangerouslySetInnerHTML={{ __html: answer.body }}
                  />
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                    <ArrowBigUp className="h-3 w-3" />
                    <span>{answer.score}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            <AnswerComposer
              questionId={question.id}
              onAnswerSubmit={handleAnswerSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
