"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

import { factoryModules } from "@/data/factory";
import { useChapter } from "@/components/interactions/use-chapter";
import { getLenis } from "@/lib/lenis-store";
import { Reveal, RevealHeading, staggerChild, staggerParent } from "@/components/ui/reveal";
import { LazyFactoryScene } from "@/components/three/lazy-factory-scene";
import { factoryState } from "@/components/three/factory-progress";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

const N = factoryModules.length;
/** Scroll per crate, as a fraction of the viewport height */
const PER = 0.55;
/** The belt starts moving when the floor's top reaches this point of the viewport */
const LEAD = 0.75;
/** Crates already travelled by the time the floor pins (the first one glides in from the right) */
const LEAD_CRATES = LEAD / PER;
/** A crate counts as "under the press" within this distance of centre, in crates */
const SNAP = 0.18;

export function FactorySection() {
  const root = useRef<HTMLElement>(null);
  const floor = useRef<HTMLDivElement>(null);
  const pin = useRef<ScrollTrigger | null>(null);
  /** Nearest crate — drives the readout and selector */
  const [active, setActive] = useState(0);
  /** Crate currently passing under the press (-1 between crates) — drives the 3D lift and stamp */
  const [pressed, setPressed] = useState(-1);
  useChapter(root, 2);

  useEffect(() => {
    const el = floor.current;
    if (!el) return;
    factoryState.progress = -LEAD_CRATES / (N - 1);

    const ctx = gsap.context(() => {
      pin.current = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * PER * (N - 1)}`,
        pin: true,
        invalidateOnRefresh: true,
      });

      /*
       * A continuous belt: it is linked 1:1 to scroll from the moment the floor
       * scrolls into view, so every wheel tick moves it. It ends exactly where
       * the pin releases. The 3D press stamps whenever the active crate changes.
       */
      gsap.fromTo(
        factoryState,
        { progress: -LEAD_CRATES / (N - 1) },
        {
          progress: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: `top ${LEAD * 100}%`,
            end: () => `+=${window.innerHeight * (LEAD + PER * (N - 1))}`,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Position along the belt, in crates (0 = first crate under the press)
              const pos = -LEAD_CRATES + self.progress * (LEAD_CRATES + N - 1);
              const i = Math.min(N - 1, Math.max(0, Math.round(pos)));
              const under = Math.abs(pos - i) < SNAP ? i : -1;
              setActive((cur) => (cur === i ? cur : i));
              setPressed((cur) => (cur === under ? cur : under));
            },
          },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  /** Scroll so crate i is under the press */
  const goTo = (i: number) => {
    const st = pin.current;
    if (!st) return;
    const y = st.start + i * window.innerHeight * PER;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const current = factoryModules[active];

  return (
    <section
      id="factory"
      ref={root}
      data-tone-left="dark"
      data-tone-right="dark"
      aria-label="03 — The Factory: engineering"
      className="side-back relative"
    >
      <div className="px-6 pb-10 pt-[16vh] text-center">
        <Reveal y={12}>
          <p className="eyebrow">
            <b>03</b>The Factory
          </p>
        </Reveal>
        <RevealHeading lines={[["Behind the products,"], [{ text: "an architecture.", em: true }]]} className="mt-4 text-[clamp(1.9rem,4.6vw,4.1rem)]" />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
            Six engineering modules, each one running in production. Take one off the belt.
          </p>
          <p className="label mt-5 inline-flex items-center gap-3">
            <span className="h-px w-10 bg-accent" /> Scroll sideways <FiArrowRight aria-hidden="true" className="drift-x text-accent" />
          </p>
        </Reveal>
      </div>

      <div ref={floor} className="relative h-[100svh] min-h-[620px] overflow-hidden">
        {/* The factory floor, in 3D — crates are clickable */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 bottom-[30vh] bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgba(0,104,204,0.32),transparent_70%)]"
          aria-hidden="true"
        />
        <LazyFactoryScene active={pressed} onSelect={goTo} className="absolute inset-x-0 top-0 bottom-[30vh]" />

        {/* Readout */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-[30vh] border-t border-line bg-night-2 px-[4vw] pt-[3.5vh]">
          <div role="group" aria-label="Engineering modules" className="absolute bottom-[calc(100%+1.25rem)] left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full border border-line bg-night-2/80 p-1.5 backdrop-blur">
            {factoryModules.map((m, i) => (
              <button
                key={m.id}
                type="button"
                onClick={() => goTo(i)}
                aria-pressed={i === active}
                aria-label={`Module ${m.number}: ${m.title}`}
                className={cn(
                  "size-9 rounded-full border font-mono text-[10px] transition-colors duration-300",
                  i === active ? "border-blue-400 bg-blue-400 text-night" : "border-line-strong text-muted hover:border-blue-400 hover:text-ink",
                )}
              >
                {m.number}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-12"
              aria-live="polite"
            >
              <div className="md:col-span-4">
                <p className="label">
                  <span className="text-accent">{current.number}</span> / {String(N).padStart(2, "0")} modules
                </p>
                <h3 className="display mt-3 text-[clamp(1.2rem,2.2vw,2rem)]">{current.title}</h3>
              </div>
              <div className="md:col-span-4">
                <p className="text-sm leading-relaxed text-muted">{current.summary}</p>
                <ul className="mt-3 space-y-1.5 max-md:hidden">
                  {current.capabilities.slice(0, 3).map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-[13px] text-ink">
                      <span className="mt-[0.6em] h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="max-md:hidden md:col-span-4">
                <motion.ul className="flex flex-wrap gap-2" variants={staggerParent} initial="hidden" animate="shown">
                  {current.technologies.map((t) => (
                    <motion.li key={t} variants={staggerChild} className="tag">
                      {t}
                    </motion.li>
                  ))}
                </motion.ul>
                <p className="label mt-4">
                  Powers <span className="text-ink">{current.projects.join(" · ")}</span>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
