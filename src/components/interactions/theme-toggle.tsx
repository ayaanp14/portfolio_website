"use client";

import { useEffect, useRef } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

import type { ThemeName } from "@/styles/palette";
import { useSite } from "@/lib/site-store";
import { cn } from "@/lib/cn";

/** Reads the theme set by the pre-paint script and keeps the store in sync. */
export function ThemeController() {
  const theme = useSite((s) => s.theme);
  const setTheme = useSite((s) => s.setTheme);

  const first = useRef(true);

  useEffect(() => {
    const initial = document.documentElement.dataset.theme as ThemeName | undefined;
    if (initial === "light" || initial === "dark") setTheme(initial);
  }, [setTheme]);

  useEffect(() => {
    // The pre-paint script already set the stored theme; don't overwrite it
    // with the store's default before the effect above has synced it.
    if (first.current) {
      first.current = false;
      return;
    }
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return null;
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSite((s) => s.theme);
  const setTheme = useSite((s) => s.setTheme);
  const next: ThemeName = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(next);
        try {
          localStorage.setItem("theme", next);
        } catch {
          /* storage unavailable — theme still applies for this visit */
        }
      }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={cn(
        "group inline-flex h-8 items-center gap-2 rounded-full border border-line-strong px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-accent",
        className,
      )}
    >
      <span className="relative block size-3.5">
        <FiSun
          aria-hidden="true"
          className={cn("absolute inset-0 size-3.5 transition-all duration-500", theme === "light" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0")}
        />
        <FiMoon
          aria-hidden="true"
          className={cn("absolute inset-0 size-3.5 transition-all duration-500", theme === "dark" ? "rotate-0 opacity-100" : "rotate-90 opacity-0")}
        />
      </span>
      <span className="hidden sm:inline">{theme === "dark" ? "Night" : "Day"}</span>
    </button>
  );
}
