import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import QACard from '@/components/qa-card';
import LoadingCard from '@/components/loading-card';
import { type Question } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { User } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"; // Added import for ScrollArea

export default function Feed() {
  const [, setLocation] = useLocation();
  const [page, setPage] = useState(1);
  const { data: questions, isLoading } = useQuery({
    queryKey: ['/api/questions', page]
  });

  const [{ y }, api] = useSpring(() => ({ y: 0 }));

  const bind = useDrag(({ down, movement: [_, my], velocity }) => {
    api.start({ y: down ? my : 0, immediate: down });
    
    if (!down && (Math.abs(my) > 100 || Math.abs(velocity) > 0.5)) {
      const shouldSwipeUp = my < 0 || velocity < -0.5;
      if (shouldSwipeUp && questions?.[page]) {
        setPage(p => p + 1);
      } else if (!shouldSwipeUp && page > 1) {
        setPage(p => p - 1);
      }
    }
  }, {
    axis: 'y',
    filterTaps: true,
    swipe: {
      velocity: 0.1
    }
  });

  if (isLoading) {
    return <LoadingCard />;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10"
        onClick={() => setLocation('/profile')}
      >
        <User className="h-5 w-5" />
      </Button>

      <AnimatePresence>
        <motion.div
          {...bind()}
          style={{ 
            transform: y.to(py => `translateY(${py}px)`)
          }}
          className="h-full w-full touch-none"
        >
          {questions?.[page - 1] && (
            <QACard key={questions[page - 1].id} question={questions[page - 1]} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}