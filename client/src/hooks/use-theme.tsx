import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readSavedTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem("stackscroll-theme") as Theme | null;
    return saved || "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readSavedTheme);

  // Apply the theme to <html> so the .dark CSS variables take effect.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("stackscroll-theme", next);
      } catch {
        // localStorage unavailable — ignore.
      }
      return next;
    });
  }, []);

  const setThemeAndPersist = useCallback(
    (next: Theme) => {
      setTheme(next);
      try {
        localStorage.setItem("stackscroll-theme", next);
      } catch {
        // localStorage unavailable — ignore.
      }
    },
    []
  );

  const value = useMemo(() => ({ theme, toggle, setTheme: setThemeAndPersist }), [theme, toggle, setThemeAndPersist]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
