import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowBigUp, MessageCircle, Check, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import { type Question } from '@shared/schema';
import { cn } from '@/lib/utils';

interface QACardProps {
  question: Question;
}

export default function QACard({ question }: QACardProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [currentScore, setCurrentScore] = useState(question.score);

  const handleUpvote = () => {
    setUpvoted(!upvoted);
    setCurrentScore(prev => upvoted ? prev - 1 : prev + 1);
  };

  const answers = Array.isArray(question.answers) ? question.answers : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 p-4"
    >
      <div className="fixed bottom-24 right-6 z-10 flex flex-col gap-3">
        <motion.div
          whileTap={{ scale: 0.9 }}
          animate={{ 
            scale: upvoted ? 1.1 : 1,
            y: upvoted ? -4 : 0
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Button
            variant={upvoted ? "default" : "outline"}
            size="icon"
            onClick={handleUpvote}
            className={cn(
              "h-12 w-12 rounded-full shadow-lg transition-colors duration-300",
              upvoted && "bg-primary text-primary-foreground"
            )}
          >
            <ArrowBigUp className="h-6 w-6" />
          </Button>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.9 }}
          animate={{ 
            scale: favorited ? 1.1 : 1,
            rotate: favorited ? 360 : 0
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg hover:bg-primary/5"
            onClick={() => setFavorited(!favorited)}
          >
            <Heart className={cn(
              "h-6 w-6 transition-all duration-300",
              favorited && "fill-primary text-primary"
            )} />
          </Button>
        </motion.div>
      </div>
      <Card className="h-full overflow-y-auto bg-gradient-to-br from-background to-muted">
        <CardHeader className="bg-gradient-to-r from-background to-muted border-b">
          <div className="flex items-center gap-4">
            <Avatar className="border-2 border-primary/20">
              <AvatarFallback className="bg-primary/5 text-primary">
                {question.authorName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {question.authorName}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Score: {currentScore}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-xl font-bold text-foreground">{question.title}</h2>
          <div 
            className="prose prose-sm max-w-none dark:prose-invert" 
            dangerouslySetInnerHTML={{ __html: question.body }} 
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswers(!showAnswers)}
              className="group transition-colors hover:bg-primary/5"
            >
              <MessageCircle className="mr-2 h-4 w-4 text-primary group-hover:text-primary" />
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
              onClick={handleUpvote}
              className={cn(
                "transition-all duration-200",
                upvoted && "bg-primary text-primary-foreground"
              )}
            >
              <ArrowBigUp className={cn(
                "mr-2 h-4 w-4 transition-transform",
                upvoted && "transform -translate-y-0.5"
              )} />
              {currentScore}
            </Button>
          </div>

          <AnimatePresence>
            {showAnswers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {answers.map((answer: any) => (
                  <Card key={answer.answer_id} className="border-primary/10 bg-gradient-to-br from-background to-muted/50">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        {answer.is_accepted && (
                          <div className="flex items-center gap-1 text-green-500">
                            <Check className="h-4 w-4" />
                            <span className="text-xs font-medium">Accepted Answer</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-primary/80">
                          {answer.owner.display_name}
                        </span>
                      </div>
                      <div
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: answer.body }}
                      />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ArrowBigUp className="h-4 w-4" />
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