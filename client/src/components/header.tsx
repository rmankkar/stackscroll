import { useLocation } from "wouter";
import { Bookmark, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  const [, setLocation] = useLocation();

  const navItems = [
    { label: "Home", href: "/feed", icon: null },
    { label: "Explore", href: "/explore", icon: null },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white bg-background/80 backdrop-blur-md backdrop-saturate-150">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* Logo + App name */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white text-xs sm:text-sm font-bold">S</span>
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight gradient-text">
            StackScroll
          </span>
        </div>

        {/* Navigation */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setLocation(item.href || "/feed")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                "text-foreground/70 hover:text-primary hover:bg-secondary",
              )}
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Search + Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-white/50 bg-secondary hover:bg-secondary/80 transition-colors">
            <Search className="h-4 w-4 text-foreground/60" />
            <span>Search</span>
          </button>
          <Button size="sm" className="hidden sm:inline-flex" onClick={() => setLocation("/ask")}>
            Ask a Question
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg text-foreground/60 hover:text-foreground hover:bg-secondary"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
