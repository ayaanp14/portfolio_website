"use client";

import { type KeyboardEvent, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";

import { missions } from "@/data/missions";
import { projectsData } from "@/data/projects";
import { profile } from "@/data/profile";
import { useSite } from "@/lib/site-store";
import { useChapter } from "@/components/interactions/use-chapter";
import { Reveal, RevealHeading, staggerChild, staggerParent } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

const rowVariants = {
  hidden: { opacity: 0, x: -24 },
  shown: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

export function MissionsSection() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const index = useSite((s) => s.missionIndex);
  const setIndex = useSite((s) => s.setMissionIndex);
  useChapter(root, 4);

  const mission = missions[index];
  const built = projectsData.filter((p) => mission.projects.includes(p.id));
  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(`Mission: ${mission.title}`)}&body=${encodeURIComponent(
    `Hi Ayaan,\n\nI'd like to talk about a ${mission.title.toLowerCase()} project.\n\n`,
  )}`;

  const select = (i: number) => {
    const n = (i + missions.length) % missions.length;
    setIndex(n);
    list.current?.querySelectorAll<HTMLButtonElement>("[role=radio]")[n]?.focus({ preventScroll: true });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") select(index + 1);
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") select(index - 1);
    else return;
    e.preventDefault();
  };

  return (
    <section
      id="missions"
      ref={root}
      data-tone-left="light"
      data-tone-right="dark"
      aria-label="05 — Choose your mission"
      className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-2"
    >
      {/* FRONT — choose */}
      <div className="side-front px-[4vw] py-[14vh] lg:pr-[3vw]">
        <Reveal y={12}>
          <p className="eyebrow">
            <b>05</b>Missions
          </p>
        </Reveal>
        <RevealHeading lines={[["Choose your"], [{ text: "mission.", em: true }]]} className="mt-4 text-[clamp(2.2rem,4.6vw,4.4rem)]" />
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
          Six kinds of work. Pick one — the email opens with it already written.
        </p>

        <motion.div
          ref={list}
          role="radiogroup"
          aria-label="Missions"
          onKeyDown={onKey}
          className="mt-10 border-t border-line"
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ staggerChildren: 0.07 }}
        >
          {missions.map((m, i) => {
            const on = i === index;
            return (
              <motion.button
                key={m.id}
                variants={rowVariants}
                type="button"
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setIndex(i)}
                className="group relative flex w-full items-center gap-5 border-b border-line py-4 text-left"
              >
                <motion.span
                  className="absolute inset-y-3 left-0 w-[3px] origin-top bg-accent"
                  initial={false}
                  animate={{ scaleY: on ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  aria-hidden="true"
                />
                <span className={cn("pl-4 font-mono text-[11px]", on ? "text-accent" : "text-faint")}>{m.number}</span>
                <span
                  className={cn(
                    "display flex-1 text-[clamp(1.05rem,2.1vw,1.9rem)] transition-all duration-500",
                    on ? "translate-x-3 text-ink" : "text-faint group-hover:text-muted",
                  )}
                >
                  {m.title}
                </span>
                <FiChevronRight aria-hidden="true" className={cn("text-accent transition-opacity", on ? "drift-x opacity-100" : "opacity-0")} />
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* BACK — briefing */}
      <div className="side-back px-[4vw] py-[14vh] lg:pl-[3.5vw]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="lg:sticky lg:top-[14vh]"
          >
            <div className="flex items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-full bg-blue-800 font-mono text-xs text-white">{mission.number}</span>
              <span className="label !text-accent">Mission selected</span>
            </div>
            <h3 className="display mt-6 text-[clamp(2rem,4.4vw,4.2rem)]">{mission.title}</h3>
            <p className="mt-6 max-w-xl text-[clamp(1rem,1.3vw,1.2rem)] leading-relaxed text-muted">{mission.description}</p>

            <p className="label mt-9 inline-flex items-center gap-3 !text-accent">
              <span className="h-px w-4 bg-accent" /> Loadout
            </p>
            <motion.ul className="mt-4 flex flex-wrap gap-2" variants={staggerParent} initial="hidden" animate="shown">
              {mission.loadout.map((t) => (
                <motion.li key={t} variants={staggerChild} className="tag">
                  {t}
                </motion.li>
              ))}
            </motion.ul>

            <p className="label mt-9 inline-flex items-center gap-3 !text-accent">
              <span className="h-px w-4 bg-accent" /> Built with it
            </p>
            <motion.ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" variants={staggerParent} initial="hidden" animate="shown">
              {built.map((p) => (
                <motion.li key={p.id} variants={staggerChild} className="group">
                  <div data-tilt className="relative aspect-[16/10] overflow-hidden rounded-md border border-line bg-white">
                    {p.screenshot ? (
                      <Image
                        src={p.screenshot}
                        alt={`${p.title} screenshot`}
                        fill
                        sizes="200px"
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <span className="display absolute inset-0 flex items-center justify-center text-lg text-ink-light">{p.title}</span>
                    )}
                  </div>
                  <p className="label mt-2">{p.title}</p>
                </motion.li>
              ))}
            </motion.ul>

            <a href={mailto} className="pill pill-accent mt-10 !h-12">
              Choose this mission <FiChevronRight aria-hidden="true" />
            </a>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
