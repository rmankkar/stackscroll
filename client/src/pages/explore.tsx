import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import QACard from "@/components/qa-card";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { type Question } from "@shared/schema";
import { cn } from "@/lib/utils";

// Client-side search result cache (5 min TTL, max 50 entries)
const searchCache = new Map<string, { results: Question[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_ENTRIES = 50;

function getCachedSearch(query: string): Question[] | null {
  const key = query.trim().toLowerCase();
  const entry = searchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    searchCache.delete(key);
    return null;
  }
  return entry.results;
}

function setCachedSearch(query: string, results: Question[]) {
  const key = query.trim().toLowerCase();
  if (searchCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = searchCache.keys().next().value;
    if (firstKey !== undefined) searchCache.delete(firstKey);
  }
  searchCache.set(key, { results, timestamp: Date.now() });
}

export default function Explore() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Debounce: update debouncedSearch 300ms after typing stops.
  // The input stays controlled and focused throughout — no API call per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset pagination and results whenever the debounced search term changes
  useEffect(() => {
    setPage(1);
    setAllQuestions([]);
    setHasMore(true);
    setIsSearching(false);
    setError(null);
  }, [debouncedSearch]);

  // Fetch questions based on debouncedSearch (normal feed or search API)
  useEffect(() => {
    const fetchQuestions = async () => {
      // No search term → normal feed from /api/questions
      if (!debouncedSearch) {
        try {
          const res = await fetch(
            `/api/questions?page=${page}${selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ""}`
          );
          const data = await res.json();
          if (data.length === 0) {
            setHasMore(false);
          } else {
            setAllQuestions((prev) => [...prev, ...data]);
          }
          setInitialLoading(false);
        } catch {
          setError("Failed to load questions. Try again.");
          setInitialLoading(false);
        } finally {
          setIsLoadingMore(false);
        }
        return;
      }

      // Search mode → check client cache first
      const cached = getCachedSearch(debouncedSearch);
      if (cached) {
        setAllQuestions(cached);
        setHasMore(cached.length > 0);
        setInitialLoading(false);
        setIsSearching(false);
        setError(null);
        return;
      }

      // Cache miss → call the API
      setAllQuestions([]);
      setHasMore(true);
      setIsSearching(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debouncedSearch)}&page=${page}${selectedTag ? `&tag=${encodeURIComponent(selectedTag)}` : ""}`
        );
        const data = await res.json();

        if (data.length === 0) {
          setHasMore(false);
          setCachedSearch(debouncedSearch, []);
        } else {
          setAllQuestions((prev) => [...prev, ...data]);
          setCachedSearch(debouncedSearch, data);
        }
        setInitialLoading(false);
      } catch {
        setError("Failed to search. Try again.");
        setInitialLoading(false);
      } finally {
        setIsSearching(false);
        setIsLoadingMore(false);
      }
    };

    fetchQuestions();
  }, [debouncedSearch, page, selectedTag]);

  // Derive popular topic tags from the questions seen so far.
  const tagCounts = allQuestions.reduce<Record<string, number>>((acc, q) => {
    q.tags.forEach((t) => {
      acc[t] = (acc[t] || 0) + 1;
    });
    return acc;
  }, {});
  const popularTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);

  const displayQuestions = selectedTag
    ? allQuestions.filter((q) => q.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase()))
    : allQuestions;

  const observerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !isLoadingMore &&
            hasMore &&
            !isSearching
          ) {
            setIsLoadingMore(true);
            setPage((p) => p + 1);
          }
        },
        { threshold: 1.0 }
      );
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, isSearching]
  );

  // Initial full-page loader (only before first data arrives)
  if (initialLoading && allQuestions.length === 0) {
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
            {/* Search bar — always mounted, focus never lost */}
            <div className="relative mb-4 sm:mb-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl border border-white/30 bg-white/50 text-foreground placeholder-text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus={!debouncedSearch && allQuestions.length === 0}
              />
              {isSearching && (
                <div className="absolute right-3 top-3 flex items-center gap-1 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Searching…</span>
                </div>
              )}
            </div>

            {/* Topic filter chips */}
            <div className="mb-4 sm:mb-6">
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground/60 mr-2 sm:mr-3">
                Topics
              </span>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    "px-3 py-1 rounded-md text-[10px] sm:text-xs font-medium border transition-colors",
                    selectedTag === null
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-white/30 bg-white/10 text-muted-foreground/70 hover:bg-white/20",
                  )}
                >
                  {selectedTag ? "Clear filter" : "All"}
                </button>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={cn(
                      "px-3 py-1 rounded-md text-[10px] sm:text-xs font-medium border transition-colors",
                      selectedTag === tag
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-white/30 bg-white/10 text-muted-foreground/70 hover:bg-white/20",
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <h3 className="text-sm font-semibold text-destructive">{error}</h3>
                <button
                  onClick={() => {
                    setError(null);
                    setDebouncedSearch("");
                    setSearch("");
                  }}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty results (search active, no results, not loading) */}
            {debouncedSearch &&
              allQuestions.length === 0 &&
              !isSearching &&
              !error && (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 sm:mb-6">
                    <Loader2 className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                    No questions found for "{debouncedSearch}"
                  </h3>
                  <p className="text-muted-foreground mt-2 sm:mt-3">
                    Try adjusting your search terms.
                  </p>
                </div>
              )}

            {/* Empty feed (no data available — e.g. Stack Overflow API throttle) */}
            {!debouncedSearch &&
              allQuestions.length === 0 &&
              !isSearching &&
              !isLoadingMore &&
              !initialLoading &&
              !error && (
                <div className="flex flex-col items-center justify-center py-20 sm:py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 sm:mb-6 opacity-50">
                    <Loader2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                    No questions available
                  </h3>
                  <p className="text-muted-foreground mt-2 sm:mt-3 max-w-xs sm:max-w-none">
                    Feed data comes from the Stack Overflow public API. It may be temporarily
                    unavailable — try again shortly, or switch to the Feed tab.
                  </p>
                </div>
              )}

            {/* Question list */}
            {!debouncedSearch || allQuestions.length > 0 ? (
              <>
                {displayQuestions.map((question) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  >
                    <QACard question={question} />
                  </motion.div>
                ))}

                <div ref={observerRef} className="h-20">
                  {isLoadingMore && (
                    <div className="flex items-center justify-center gap-2 py-4 sm:py-6">
                      <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading more…</span>
                    </div>
                  )}
                  {!hasMore && allQuestions.length > 0 && (
                    <div className="flex items-center justify-center py-4 sm:py-6">
                      <span className="text-sm text-muted-foreground">No more questions</span>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
