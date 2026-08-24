"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMoon, FiSun } from "react-icons/fi";

import { cn } from "@/lib/cn";

type Theme = "dark" | "light";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);

    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage blocked — theme still applies for this visit.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className={cn(
        "grid size-10 place-items-center overflow-hidden rounded-full border border-line text-ink transition-colors duration-300 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -100, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 100, scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="grid place-items-center"
        >
          {theme === "light" ? <FiMoon aria-hidden="true" /> : <FiSun aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
