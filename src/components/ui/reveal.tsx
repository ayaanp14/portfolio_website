"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { animate, motion, useInView, type Variants } from "framer-motion";

import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

const wordVariants: Variants = {
  hidden: { y: "110%" },
  shown: (i: number) => ({ y: "0%", transition: { duration: 0.9, ease: EASE, delay: i * 0.05 } }),
};

type Line = string | { text: string; em?: boolean };

/**
 * Editorial headline reveal — each word slides up from behind its own mask.
 * Lines are arrays of segments so emphasised words can be styled.
 */
export function RevealHeading({
  lines,
  as: Tag = "h2",
  className,
  play,
}: {
  lines: Line[][];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** Controlled playback (e.g. after loading); defaults to in-view */
  play?: boolean;
}) {
  let index = 0;
  const controlled = play !== undefined;
  const MotionTag = motion[Tag];

  return (
    <MotionTag
      className={cn("display", className)}
      initial="hidden"
      {...(controlled ? { animate: play ? "shown" : "hidden" } : { whileInView: "shown", viewport: { once: true, margin: "-10% 0px" } })}
    >
      {lines.map((line, li) => (
        <span key={li} className="block">
          {line.map((seg, si) => {
            const text = typeof seg === "string" ? seg : seg.text;
            const em = typeof seg !== "string" && seg.em;
            return text.split(" ").filter(Boolean).map((word, wi) => {
              const i = index++;
              const content = (
                <motion.span custom={i} variants={wordVariants} className="inline-block will-change-transform">
                  {word}
                </motion.span>
              );
              return (
                <span key={`${si}-${wi}`} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                  {em ? <span className="hl">{content}</span> : content}
                  <span>&nbsp;</span>
                </span>
              );
            });
          })}
        </span>
      ))}
    </MotionTag>
  );
}

/** Simple fade-up block reveal on entering the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Parent/child variants for lists whose items pop in one after another. */
export const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.05 } },
};
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  shown: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

/** A number that counts up from zero the first time it scrolls into view. */
export function CountUp({ to, suffix = "", className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, to, suffix]);

  return (
    <span ref={ref} className={className}>
      {to}
      {suffix}
    </span>
  );
}

/** `02 — THE STREET` style chapter label. */
export function ChapterLabel({ number, title, className }: { number: string; title: string; className?: string }) {
  return (
    <Reveal className={cn("flex items-center gap-3", className)} y={12}>
      <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-accent">{number}</span>
      <span className="h-px w-10 bg-line-strong" />
      <span className="label text-ink">{title}</span>
    </Reveal>
  );
}
