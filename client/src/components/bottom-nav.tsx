import { useLocation } from "wouter";
import { Home, Search, Bookmark, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: BottomNavItem[] = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Explore", href: "/explore", icon: Search },
  { label: "Ask", href: "/ask", icon: PlusCircle },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { label: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white bg-background/80 backdrop-blur-md backdrop-saturate-150 px-4 sm:px-6 pb-4 sm:pb-6">
      <div className="flex items-center justify-between max-w-[600px] mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <button
              key={item.label}
              onClick={() => {
                // eslint-disable-next-line no-restricted-globals
                if (typeof window !== "undefined") {
                  window.history.pushState({}, "", item.href);
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/50 hover:text-foreground hover:bg-secondary/50",
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "" : "")} />
              <span className="text-[10px] sm:text-xs font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
