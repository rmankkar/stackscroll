import { useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnswerComposerProps {
  questionId: number;
  onAnswerSubmit?: (answer: string) => void;
}

export default function AnswerComposer({ questionId, onAnswerSubmit }: AnswerComposerProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    onAnswerSubmit?.(text.trim());
    setText("");
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 pt-4 sm:pt-5 border-t border-white/20"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write an answer..."
        className="flex-1 min-h-[60px] sm:min-h-[80px] resize-none border border-white/30 rounded-xl bg-white/50 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-foreground placeholder-text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
        disabled={submitting}
      />
      <Button
        type="submit"
        disabled={!text.trim() || submitting}
        className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-medium transition-all disabled:opacity-50"
      >
        {submitting ? null : <ArrowRight className="h-4 w-4 mr-1.5" />}
        Answer
      </Button>
    </form>
  );
}
