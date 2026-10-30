"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { useSystemStore } from "@/lib/system-store";
import { prefersReducedMotion } from "@/lib/quality";

const FRONT_STEPS = ["Sketching wireframes", "Picking the palette", "Setting the type", "Polishing pixels", "Front ready"];
const BACK_STEPS = ["$ booting server", "$ connecting database", "$ compiling routes", "$ GET /api/health", "✓ all systems go"];

/** Letters that rise from behind a mask, one after another (CSS, so it runs before hydration). */
function RiseWord({ text, start = 0, className }: { text: string; start?: number; className?: string }) {
  return (
    <span className={`inline-block overflow-hidden pb-[0.06em] align-bottom ${className ?? ""}`}>
      {Array.from(text).map((ch, i) => (
        <span key={i} data-ch className="rise-in inline-block" style={{ "--i": start + i } as CSSProperties}>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

/**
 * Opening curtain: a FRONT half that sketches a page and a BACK half that
 * boots a server, joined by a seam that fills as the site loads. When fonts
 * are ready the text lifts away and the halves slide apart onto the hero.
 */
export function Loader() {
  const left = useRef<HTMLDivElement>(null);
  const right = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const seam = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const frontStep = useRef<HTMLSpanElement>(null);
  const backLog = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const setBooted = useSystemStore((s) => s.setBooted);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let fontsReady = false;
    let done = false;
    let step = -1;
    const started = performance.now();
    const p = { v: 0 };
    document.fonts?.ready.then(() => (fontsReady = true));

    const render = () => {
      const v = p.v / 100;
      if (count.current) count.current.textContent = `${String(Math.round(p.v)).padStart(3, "0")}%`;
      if (seam.current) seam.current.style.transform = `scaleY(${v})`;
      if (bar.current) bar.current.style.transform = `scaleX(${v})`;

      const next = Math.min(FRONT_STEPS.length - 1, Math.floor(v * (FRONT_STEPS.length - 1) + 0.0001));
      if (next === step) return;
      step = next;
      if (frontStep.current) frontStep.current.textContent = FRONT_STEPS[next];
      // Reveal one more terminal line per step
      backLog.current?.querySelectorAll<HTMLElement>("[data-log]").forEach((line, i) => {
        line.style.opacity = i <= next ? "1" : "0";
        line.style.transform = i <= next ? "none" : "translateY(6px)";
      });
    };
    render();

    const finish = () => {
      done = true;
      if (reduced) {
        setBooted(true);
        setGone(true);
        return;
      }
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .to(p, { v: 100, duration: 0.45, ease: "power2.out", onUpdate: render })
        .to("[data-loader] [data-ch]", { yPercent: -110, duration: 0.6, stagger: 0.025, ease: "power3.in" }, "+=0.25")
        .to("[data-loader] [data-fade]", { autoAlpha: 0, y: -10, duration: 0.4, stagger: 0.04 }, "<")
        .to(chrome.current, { autoAlpha: 0, duration: 0.35 }, "<0.2")
        .add(() => setBooted(true))
        .to(left.current, { xPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=0.1")
        .to(right.current, { xPercent: 100, duration: 1.1, ease: "expo.inOut" }, "<");
    };

    const tick = () => {
      if (done) return;
      const t = performance.now() - started;
      const ready = (fontsReady && t > 1800) || t > 4500;
      // Ease toward 92% while waiting, then all the way once ready
      p.v += ((ready ? 100 : 92) - p.v) * 0.035;
      render();
      if (ready) finish();
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [setBooted]);

  if (gone) return null;

  return (
    <div data-loader className="fixed inset-0 z-[100] flex" role="status" aria-label="Loading">
      {/* FRONT */}
      <div ref={left} className="side-front grid-lines relative flex w-1/2 flex-col items-end justify-center overflow-hidden pr-[3vw]">
        <p data-fade className="label absolute left-[4vw] top-[5vh]">
          Portfolio · {new Date().getFullYear()}
        </p>

        {/* A page wireframe sketching itself */}
        <div data-fade className="absolute left-[4vw] top-1/2 hidden w-[min(22vw,300px)] -translate-y-1/2 lg:block" aria-hidden="true">
          <div className="overflow-hidden rounded-lg border border-line-strong">
            <div className="sketch flex h-5 items-center gap-1.5 bg-blue-800 px-2.5" style={{ "--d": "0.2s" } as CSSProperties}>
              <span className="size-1.5 rounded-full bg-white" />
              <span className="size-1.5 rounded-full bg-white" />
              <span className="size-1.5 rounded-full bg-white" />
            </div>
            <div className="space-y-2 p-4">
              <span className="sketch block h-3 w-3/5 bg-ink-light" style={{ "--d": "0.5s" } as CSSProperties} />
              <span className="sketch block h-1.5 w-full bg-paper-4" style={{ "--d": "0.7s" } as CSSProperties} />
              <span className="sketch block h-1.5 w-4/5 bg-paper-4" style={{ "--d": "0.85s" } as CSSProperties} />
              <span className="sketch mt-3 block h-5 w-2/5 rounded-full bg-blue-800" style={{ "--d": "1.05s" } as CSSProperties} />
            </div>
          </div>
        </div>

        <div className="relative">
          <span className="display text-right text-[clamp(1.6rem,5vw,4.5rem)]">
            <RiseWord text="Ayaan" />
          </span>
          <p data-fade className="label absolute right-0 top-full mt-5 inline-flex items-center gap-2.5 whitespace-nowrap">
            <span className="spin size-3 rounded-full border-2 border-line-strong border-t-accent" aria-hidden="true" />
            <span ref={frontStep}>{FRONT_STEPS[0]}</span>
          </p>
        </div>
      </div>

      {/* BACK */}
      <div ref={right} className="side-back relative flex w-1/2 flex-col justify-center overflow-hidden pl-[3vw]">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <p data-fade className="label absolute right-[4vw] top-[5vh] inline-flex items-center gap-2">
          <span className="pulse-dot size-1.5 rounded-full bg-accent" aria-hidden="true" /> Booting
        </p>

        <div className="relative">
          <span className="display text-[clamp(1.6rem,5vw,4.5rem)]">
            <RiseWord text="in the" start={5} /> <RiseWord text="code" start={11} className="hl" />
          </span>

          <div ref={backLog} data-fade className="absolute left-0 top-full mt-5 space-y-1 font-mono text-[11px] tracking-[0.06em] text-muted" aria-hidden="true">
            {BACK_STEPS.map((s, i) => (
              <p
                key={s}
                data-log
                className={`transition-[opacity,transform] duration-300 ${i === BACK_STEPS.length - 1 ? "text-accent" : ""}`}
                style={{ opacity: 0 }}
              >
                {s}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Seam, counter, progress bar — fade before the halves part */}
      <div ref={chrome} className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[color-mix(in_srgb,#888_30%,transparent)]" />
        <span ref={seam} className="absolute inset-y-0 left-1/2 w-[2px] origin-top -translate-x-1/2 bg-blue-400 shadow-[0_0_14px_rgba(58,169,255,0.8)]" style={{ transform: "scaleY(0)" }} />
        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[color-mix(in_srgb,#888_20%,transparent)]" />
        <span ref={bar} className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-blue-800" style={{ transform: "scaleX(0)" }} />
        <span className="absolute bottom-[8vh] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-blue-800 px-4 py-2 font-mono text-xs tabular-nums text-white">
          <span className="relative flex size-2">
            <span className="ping-ring absolute inset-0 rounded-full bg-blue-300" />
            <span className="relative size-2 rounded-full bg-white" />
          </span>
          <span ref={count}>000%</span>
        </span>
      </div>
    </div>
  );
}
