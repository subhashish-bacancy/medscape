"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (value: Theme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "medscape-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  if (theme === "system") {
    return prefersDark ? "dark" : "light";
  }

  return theme;
}

function applyThemeToDom(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const stored = localStorage.getItem(STORAGE_KEY);
    const initialTheme: Theme =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";

    const apply = (nextTheme: Theme) => {
      const resolved = resolveTheme(nextTheme, mediaQuery.matches);
      setThemeState(nextTheme);
      setResolvedTheme(resolved);
      applyThemeToDom(resolved);
    };

    apply(initialTheme);

    const onSystemThemeChange = () => {
      const persisted = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const activeTheme = persisted ?? "system";

      if (activeTheme === "system") {
        apply("system");
      }
    };

    mediaQuery.addEventListener("change", onSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", onSystemThemeChange);
    };
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      resolvedTheme,
      setTheme: (nextTheme) => {
        localStorage.setItem(STORAGE_KEY, nextTheme);
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        const resolved = resolveTheme(nextTheme, prefersDark);
        setThemeState(nextTheme);
        setResolvedTheme(resolved);
        applyThemeToDom(resolved);
      },
      toggleTheme: () => {
        const nextResolved: ResolvedTheme =
          resolvedTheme === "dark" ? "light" : "dark";
        localStorage.setItem(STORAGE_KEY, nextResolved);
        setThemeState(nextResolved);
        setResolvedTheme(nextResolved);
        applyThemeToDom(nextResolved);
      },
    };
  }, [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
