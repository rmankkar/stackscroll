import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Mail, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";

export default function Ask() {
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stackOverflowId: Date.now(),
          title: title.trim(),
          body: `<p>${body.trim()}</p>`,
          score: 0,
          authorName: "You",
          answers: [],
        }),
      });
      if (response.ok) {
        setLocation("/feed");
      }
    } catch {
      // Error handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-background overflow-hidden relative">
      <Header />

      <main className="relative z-10 h-full w-full overflow-y-auto pb-20 sm:pb-0 lg:pb-0">
        <div className="mx-auto w-full max-w-[500px] px-4 sm:px-6 lg:px-8">
          <div className="pt-6 sm:pt-8 pb-12 sm:pb-16 lg:pb-20">
            {/* Back button */}
            <button
              onClick={() => setLocation("/feed")}
              className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-primary/70 hover:text-primary mb-6 sm:mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              Back to feed
            </button>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-foreground">
                  Title
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your question?"
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-foreground">
                  Details (optional)
                </Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Add context, code snippets, or details..."
                  rows={4}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="flex items-center justify-between pt-4 sm:pt-6">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Posting as "You"
                </span>
                <Button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? null : <Send className="h-4 w-4 mr-2" />}
                  Ask Question
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
