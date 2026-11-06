import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowBigUp,
  MessageCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
} from "lucide-react";
import { type Question } from "@shared/schema";
import { cn } from "@/lib/utils";

interface QACardProps {
  question: Question;
}

const VOTE_COLORS = [
  { from: "from-primary", to: "to-primary/80" },
  { from: "from-accent", to: "to-accent/80" },
  { from: "from-emerald-500", to: "to-emerald-400" },
  { from: "from-amber-500", to: "to-amber-400" },
  { from: "from-cyan-500", to: "to-cyan-400" },
];

function voteGradient(index: number) {
  return VOTE_COLORS[index % VOTE_COLORS.length];
}

export default function QACard({ question }: QACardProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [currentScore, setCurrentScore] = useState(question.score);

  const handleUpvote = () => {
    setUpvoted((prev) => {
      const next = !prev;
      setCurrentScore((s) => (prev ? s - 1 : s + 1));
      return next;
    });
  };

  const answers = Array.isArray(question.answers) ? question.answers : [];
  const gradient = voteGradient(question.id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 p-4 sm:p-6"
    >
      {/* Floating action column */}
      <div className="fixed bottom-1/2 right-4 z-20 flex flex-col gap-2 sm:right-6">
        <motion.div
          whileTap={{ scale: 0.9 }}
          animate={{
            scale: upvoted ? 1.1 : 1,
            y: upvoted ? -4 : 0,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
        >
          <Button
            variant={upvoted ? "default" : "outline"}
            size="icon"
            className={cn(
              "w-12 h-12 rounded-full shadow-lg transition-all duration-300",
              upvoted
                ? "bg-gradient-to-b from-primary to-accent text-primary-foreground shadow-[0_0_16px_hsl(var(--primary-glow))]"
                : "hover:bg-accent/10 hover:text-accent-foreground"
            )}
            onClick={handleUpvote}
          >
            <ArrowBigUp className="h-6 w-6" />
          </Button>
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.9 }}
          animate={{
            scale: favorited ? 1.1 : 1,
            rotate: favorited ? 360 : 0,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
        >
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full shadow-lg transition-all hover:bg-accent/10"
            onClick={() => setFavorited((f) => !f)}
          >
            <Heart
              className={cn(
                "h-6 w-6 transition-all duration-300",
                favorited && "fill-accent-foreground text-accent-foreground drop-shadow-[0_0_8px_hsl(var(--accent-glow))]"
              )}
            />
          </Button>
        </motion.div>
      </div>

      <Card
        className={cn(
          "h-full overflow-y-auto glass rounded-2xl border border-white/10 shadow-2xl card-hover",
          "bg-gradient-to-b from-card/90 to-muted/40"
        )}
      >
        <CardHeader className="bg-transparent border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-white/10 ring-2 ring-white/5">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-foreground">
                {question.authorName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className={cn("text-base font-semibold leading-none", gradient)}>
                {question.authorName}
              </CardTitle>
              <p className="text-xs text-muted-foreground/70 tracking-wide uppercase">
                Score: {currentScore}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug text-balance">
            {question.title}
          </h2>

          <div
            className="prose prose-sm sm:prose-base max-w-none dark:prose-invert text-muted-foreground/90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.body }}
          />

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "glass flex-1 px-3 py-2.5 rounded-xl transition-all group hover:bg-accent/5 hover:text-accent-foreground",
                "border-border/50"
              )}
              onClick={() => setShowAnswers((s) => !s)}
            >
              <MessageCircle className="mr-2 h-4 w-4 group-hover:text-accent-foreground transition-colors" />
              {answers.length} Answers
              {showAnswers ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
            <Button
              variant={upvoted ? "default" : "outline"}
              size="sm"
              className={cn(
                "px-3 py-2.5 rounded-xl transition-all duration-200",
                upvoted
                  ? "bg-gradient-to-b from-primary to-accent text-primary-foreground"
                  : "glass border-border/50 hover:bg-accent/5"
              )}
            >
              <ArrowBigUp
                className={cn(
                  "mr-2 h-4 w-4 transition-transform",
                  upvoted && "transform -translate-y-0.5"
                )}
              />
              {currentScore}
            </Button>
          </div>

          <AnimatePresence>
            {showAnswers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {answers.map((answer: any) => (
                  <Card
                    key={answer.answer_id}
                    className={cn(
                      "rounded-xl border border-white/5 bg-gradient-to-b from-background/50 to-muted/20",
                      answer.is_accepted && "border-accent/30"
                    )}
                  >
                    <CardContent className="p-3.5 space-y-2.5">
                      <div className="flex items-center gap-2">
                        {answer.is_accepted && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check className="h-3.5 w-3.5" />
                            <span>Accepted Answer</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-primary/80">
                          {answer.owner.display_name}
                        </span>
                      </div>
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground/90 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: answer.body }}
                      />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                        <ArrowBigUp className="h-3.5 w-3.5" />
                        {answer.score} points
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
