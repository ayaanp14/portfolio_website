"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowUpRight, FiChevronRight, FiMenu, FiX } from "react-icons/fi";

import { chapters, navigationItems } from "@/config/navigation";
import { profile } from "@/data/profile";
import { useSystemStore } from "@/lib/system-store";
import { useSite } from "@/lib/site-store";
import { getLenis } from "@/lib/lenis-store";
import { ThemeToggle } from "@/components/interactions/theme-toggle";
import { BrandMark } from "@/components/navigation/brand";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Which side of the story a section shows: FRONT, BACK, or neutral (follows the page theme). */
type Tone = "front" | "back" | "theme";

/**
 * Reads data-tone-left/right ("light" = FRONT side, "dark" = BACK side,
 * "theme" = neutral) of whatever section sits under a given y. The actual
 * colours come from the theme, via the .tone-front / .tone-back palettes.
 */
function toneAt(y: number, side: "left" | "right"): Tone {
  const sections = document.querySelectorAll<HTMLElement>("[data-tone-left]");
  for (const s of sections) {
    const r = s.getBoundingClientRect();
    if (r.top <= y && r.bottom > y) {
      const t = s.dataset[side === "left" ? "toneLeft" : "toneRight"];
      return t === "dark" ? "back" : t === "light" ? "front" : "theme";
    }
  }
  return "theme";
}

export function scrollToHash(hash: string) {
  const target = document.querySelector(hash);
  if (!target) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(target as HTMLElement, { duration: 1.6 });
  else target.scrollIntoView({ behavior: "smooth" });
}

function LocalClock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="label hidden items-center gap-2 !text-ink lg:inline-flex">
      <span className="pulse-dot size-1.5 rounded-full bg-accent" aria-hidden="true" />
      Indore <span className="tabular-nums">{time}</span>
    </span>
  );
}

export function Navbar() {
  const booted = useSystemStore((s) => s.booted);
  const chapter = useSite((s) => s.chapter);
  const inStory = useSite((s) => s.inStory);
  const theme = useSite((s) => s.theme);
  const [open, setOpen] = useState(false);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const fadeL = useRef<HTMLDivElement>(null);
  const fadeR = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  // Tone + progress follow the scroll without React renders
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const set = (el: HTMLElement | null, tone: Tone) => {
        if (!el) return;
        el.classList.toggle("tone-front", tone === "front");
        el.classList.toggle("tone-back", tone === "back");
      };
      const tl = toneAt(36, "left");
      const tr = toneAt(36, "right");
      set(leftRef.current, tl);
      set(rightRef.current, tr);
      set(fadeL.current, tl);
      set(fadeR.current, tr);
      // Pinned story scenes manage their own top edge
      const under = Array.from(document.querySelectorAll<HTMLElement>("[data-tone-left]")).find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= 36 && r.bottom > 36;
      });
      const fade = under?.dataset.headerFade === "off" ? "0" : "1";
      if (fadeL.current) fadeL.current.style.opacity = fade;
      if (fadeR.current) fadeR.current.style.opacity = fade;
      set(railRef.current, toneAt(window.innerHeight / 2, "right"));
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}%`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const show = booted ? { opacity: 1, y: 0 } : {};

  return (
    <>
      <span className="pointer-events-none fixed inset-x-0 top-0 z-[61] h-[3px]" aria-hidden="true">
        <span ref={barRef} className="block h-full origin-left scale-x-0 bg-blue-500" />
      </span>

      {/* Content fades out beneath the header, matching whatever side it's over */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[59] flex h-24" aria-hidden="true">
        <div ref={fadeL} className="tone-front h-full w-1/2 bg-gradient-to-b from-bg via-bg/80 to-transparent" />
        <div ref={fadeR} className="tone-back h-full w-1/2 bg-gradient-to-b from-bg via-bg/80 to-transparent" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={show}
        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex h-20 items-center justify-between px-[4vw]"
      >
        <div ref={leftRef} className="tone-front pointer-events-auto">
          <a href="#index" className="group flex items-center gap-3" aria-label="Ayaan Pathan — back to the start">
            <BrandMark className="size-8 transition-transform duration-500 group-hover:rotate-90" />
            <span className="leading-none">
              <span className="display block text-[19px] text-ink">Ayaan</span>
              <span className="mt-1 block font-mono text-[9.5px] uppercase tracking-[0.22em] text-accent">in the code</span>
            </span>
          </a>
        </div>

        <div ref={rightRef} className="tone-back pointer-events-auto flex items-center gap-7">
          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {navigationItems.map((item) => {
              const active = item.chapter === chapter || (item.label === "Work" && chapter > 0 && chapter < 5);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  data-active={active}
                  aria-current={active ? "location" : undefined}
                  className={cn("link-sweep font-mono text-[11px] uppercase tracking-[0.2em]", active ? "font-semibold text-ink" : "text-muted hover:text-ink")}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
          <span className="hidden h-5 w-px bg-line-strong lg:block" aria-hidden="true" />
          <LocalClock />
          <span ref={pctRef} className="w-9 text-right font-mono text-[11px] tabular-nums text-ink" aria-label="Page progress">
            0%
          </span>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex size-9 items-center justify-center text-ink md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <FiMenu aria-hidden="true" className="size-5" />
          </button>
        </div>
      </motion.header>

      {/* Chapter rail */}
      <motion.div
        ref={railRef}
        initial={{ opacity: 0 }}
        animate={booted ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="tone-back fixed right-[1.6vw] top-1/2 z-[55] hidden -translate-y-1/2 md:block"
      >
        <ol className="flex flex-col items-end gap-3.5" aria-label="Chapters">
          {chapters.map((c, i) => {
            const on = i === chapter;
            return (
              <li key={c.id}>
                <a href={`#${c.id}`} className="group flex items-center gap-3" aria-label={`${c.number} ${c.label}`} aria-current={on ? "location" : undefined}>
                  <span className={cn("font-mono text-[10px] tabular-nums transition-colors", on ? "font-bold text-ink" : "text-faint group-hover:text-ink")}>{c.number}</span>
                  <span className={cn("h-px transition-all duration-500", on ? "w-10 bg-ink" : "w-4 bg-line-strong")} />
                </a>
              </li>
            );
          })}
        </ol>
      </motion.div>

      {/* Skip the story */}
      <AnimatePresence>
        {booted && inStory && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => scrollToHash("#street")}
            className="tone-back pill fixed bottom-[3.5vh] right-[4vw] z-[56] border border-line-strong bg-bg/60 text-ink backdrop-blur max-md:hidden"
          >
            Skip the story <FiChevronRight aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="side-back fixed inset-0 z-[90] flex flex-col px-6 pb-8"
          >
            <div className="flex h-20 items-center justify-between">
              <span className="label">Chapters</span>
              <button type="button" onClick={() => setOpen(false)} className="inline-flex size-9 items-center justify-center" aria-label="Close menu" autoFocus>
                <FiX aria-hidden="true" className="size-5" />
              </button>
            </div>
            <ul className="mt-4 flex-1">
              {chapters.map((c, i) => (
                <li key={c.id} className="border-b border-line">
                  <a
                    href={`#${c.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      window.setTimeout(() => scrollToHash(`#${c.id}`), 350);
                    }}
                    className="flex items-baseline gap-4 py-4"
                  >
                    <span className={cn("font-mono text-xs", i === chapter ? "text-accent" : "text-faint")}>{c.number}</span>
                    <span className="display text-2xl">{c.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { label: "Email", href: `mailto:${profile.email}` },
                { label: "GitHub", href: profile.links.github },
                { label: "LinkedIn", href: profile.links.linkedin },
              ].map((l) => (
                <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel={l.href.startsWith("http") ? "noreferrer" : undefined} className="label inline-flex items-center gap-1 !text-ink">
                  {l.label} <FiArrowUpRight aria-hidden="true" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
