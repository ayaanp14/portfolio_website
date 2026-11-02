"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { FiArrowUpRight, FiGithub, FiX } from "react-icons/fi";

import type { ProjectData } from "@/data/projects";
import { getLenis } from "@/lib/lenis-store";
import { CountUp } from "@/components/ui/reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Content blocks arrive one after another once the panel has slid in */
const list: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/** Strips the protocol for display: https://codekairo.com → codekairo.com */
const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/**
 * Project detail drawer — the full case study (problem, architecture,
 * results) with every feature and metric from the project data.
 */
export function ProjectExplorer({ project, onClose }: { project: ProjectData | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!project) return;
    const lenis = getLenis();
    lenis?.stop();
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[95] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.25 } }}
          transition={{ duration: 0.4 }}
        >
          <button
            type="button"
            aria-label="Close project details"
            className="absolute inset-0 bg-[rgba(10,10,10,0.55)] backdrop-blur-[6px]"
            onClick={onClose}
            tabIndex={-1}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="explorer-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.85, ease: EASE }}
            data-lenis-prevent
            className="side-front relative h-full w-full max-w-2xl overflow-y-auto shadow-[-30px_0_80px_rgba(0,0,0,0.25)]"
          >
            {/* Accent stripe that draws across as the panel lands */}
            <motion.span
              className="absolute inset-x-0 top-0 z-20 h-1 origin-left bg-blue-800"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: EASE, delay: 0.3 }}
              aria-hidden="true"
            />

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-bg/85 px-6 py-4 backdrop-blur-md md:px-10">
              <span className="label inline-flex items-center gap-2 !text-accent">
                <span className="pulse-dot size-1.5 rounded-full bg-accent" aria-hidden="true" />
                {project.category}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="group inline-flex size-10 items-center justify-center rounded-full border border-line-strong text-ink transition-colors duration-300 hover:border-blue-800 hover:bg-blue-800 hover:text-white"
                aria-label="Close"
              >
                <FiX aria-hidden="true" className="transition-transform duration-500 group-hover:rotate-90" />
              </button>
            </div>

            <motion.div className="px-6 pb-16 pt-10 md:px-10" variants={list} initial="hidden" animate="shown">
              <motion.p variants={item} className="label">
                {project.role} · {project.duration}
              </motion.p>
              <div className="mt-3 overflow-hidden pb-[0.08em]">
                <motion.h2
                  id="explorer-title"
                  className="display text-[clamp(2rem,5.4vw,3.6rem)] text-ink"
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                >
                  {project.title}
                </motion.h2>
              </div>
              <motion.p variants={item} className="mt-2 font-medium text-ink">
                {project.tagline}
              </motion.p>

              {project.spotlight && (
                <motion.p
                  variants={item}
                  className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-blue-800 bg-blue-50 px-4 py-3 text-sm text-blue-900"
                >
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-blue-800">
                    <span className="pulse-dot size-1.5 rounded-full bg-blue-800" aria-hidden="true" />★ Special project
                  </span>
                  <span className="font-medium">{project.spotlight}</span>
                  {project.links.live && (
                    <a href={project.links.live} target="_blank" rel="noreferrer" className="link-sweep font-mono text-[12px] text-blue-800">
                      {host(project.links.live)} ↗
                    </a>
                  )}
                </motion.p>
              )}

              {/* Live screenshot in a browser frame */}
              {project.screenshot && (
                <motion.figure variants={item} className="group mt-8 overflow-hidden rounded-xl border border-line-strong bg-surface">
                  <div className="flex h-9 items-center gap-3 border-b border-line px-4">
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="size-2.5 rounded-full bg-surface-3" />
                      <span className="size-2.5 rounded-full bg-surface-3" />
                      <span className="size-2.5 rounded-full bg-blue-800" />
                    </span>
                    {project.links.live && (
                      <span className="mx-auto rounded-full bg-bg px-4 py-0.5 font-mono text-[10.5px] text-muted">{host(project.links.live)}</span>
                    )}
                  </div>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <motion.div
                      className="absolute inset-0"
                      initial={{ scale: 1.15 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.6, ease: EASE, delay: 0.4 }}
                    >
                      <Image
                        src={project.screenshot}
                        alt={`${project.title} — live product screenshot`}
                        fill
                        sizes="(max-width: 768px) 100vw, 640px"
                        className="object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                      />
                    </motion.div>
                  </div>
                </motion.figure>
              )}

              <motion.p variants={item} className="mt-7 text-[15px] leading-relaxed text-muted">
                {project.description}
              </motion.p>

              <motion.div variants={item} className="mt-7 flex flex-wrap gap-3">
                {project.links.live && (
                  <a href={project.links.live} target="_blank" rel="noreferrer" className="pill pill-accent !h-12">
                    Visit {host(project.links.live)} <FiArrowUpRight aria-hidden="true" />
                  </a>
                )}
                {project.links.github && (
                  <a href={project.links.github} target="_blank" rel="noreferrer" className="pill pill-outline !h-12">
                    <FiGithub aria-hidden="true" /> GitHub
                  </a>
                )}
              </motion.div>

              {project.metrics.length > 0 && (
                <motion.dl variants={item} className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
                  {project.metrics.map((m) => (
                    <div key={m.label} className="flex flex-col-reverse justify-end bg-bg p-4 transition-colors duration-300 hover:bg-surface">
                      <dt className="label mt-2 text-[10px] leading-snug">{m.label}</dt>
                      <dd className="display text-[clamp(1.25rem,2.2vw,1.6rem)] text-ink">
                        <CountUp to={m.value} suffix={m.suffix ?? ""} />
                      </dd>
                    </div>
                  ))}
                </motion.dl>
              )}

              {(
                [
                  ["01", "The problem", project.caseStudy.problem],
                  ["02", "The architecture", project.caseStudy.architecture],
                  ["03", "The result", project.caseStudy.results],
                ] as const
              ).map(([n, title, body]) => (
                <motion.section key={n} variants={item} className="mt-10 border-t border-line pt-6">
                  <h3 className="flex items-baseline gap-3">
                    <span className="font-mono text-[11px] text-accent">{n}</span>
                    <span className="display text-2xl text-ink">{title}</span>
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted">{body}</p>
                </motion.section>
              ))}

              <motion.section variants={item} className="mt-10 border-t border-line pt-6">
                <h3 className="label text-ink">Key features</h3>
                <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {project.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-[0.6em] h-px w-3 shrink-0 bg-accent" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.section>

              <motion.section variants={item} className="mt-10 border-t border-line pt-6">
                <h3 className="label text-ink">Stack</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((t) => (
                    <li key={t} className="tag transition-colors duration-300 hover:border-blue-800 hover:text-blue-800">
                      {t}
                    </li>
                  ))}
                </ul>
              </motion.section>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
