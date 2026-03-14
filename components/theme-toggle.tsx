"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label={
          resolvedTheme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-strong)] text-[var(--foreground)] shadow-sm transition-colors duration-300 hover:border-[var(--brand)] hover:text-[var(--brand)]"
        onClick={toggleTheme}
        type="button"
      >
        <Sun
          className={`h-5 w-5 transition-all duration-300 ${
            resolvedTheme === "dark" ? "scale-75 opacity-0" : "opacity-100"
          }`}
        />
        <Moon
          className={`absolute h-5 w-5 transition-all duration-300 ${
            resolvedTheme === "dark" ? "opacity-100" : "scale-75 opacity-0"
          }`}
        />
      </button>

      <button
        aria-label="Use system theme"
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-[var(--panel-strong)] shadow-sm transition-colors duration-300 ${
          theme === "system"
            ? "border-[var(--brand)] text-[var(--brand)]"
            : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
        }`}
        onClick={() => setTheme("system")}
        type="button"
      >
        <Monitor className="h-5 w-5" />
      </button>
    </div>
  );
}
