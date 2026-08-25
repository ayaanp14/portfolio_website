"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowLeft,
  FiArrowRight,
  FiArrowUpRight,
  FiExternalLink,
  FiFolder,
  FiGithub,
} from "react-icons/fi";

import { SectionHeading, SysPanel } from "@/components/core/panel";
import { ProjectHologram } from "@/components/home/project-hologram";
import { projectsData } from "@/data/projects";
import { getLenis } from "@/lib/lenis-store";

gsap.registerPlugin(ScrollTrigger);

const ease = [0.16, 1, 0.3, 1] as const;

export function ProjectsSection() {
  const [index, setIndex] = useState(0);
  const [caseOpen, setCaseOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const indexRef = useRef(0);
  const project = projectsData[index];

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Pin only on desktop — on mobile the stacked layout is taller than the
  // viewport, so it stays a normal section with button navigation.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setPinned(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Pinned scroll-driven project switching: the wrapper spans one viewport
  // height per project and scrolling through it advances the active
  // project, firing the existing enter/exit animations.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!pinned || !wrapper) return;

    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const next = Math.min(
          projectsData.length - 1,
          Math.floor(self.progress * projectsData.length),
        );
        if (next !== indexRef.current) {
          indexRef.current = next;
          setIndex(next);
          setCaseOpen(false);
        }
      },
    });
    stRef.current = st;
    ScrollTrigger.refresh();

    return () => {
      st.kill();
      stRef.current = null;
    };
  }, [pinned]);

  const select = (next: number) => {
    const count = projectsData.length;
    const target = ((next % count) + count) % count;
    const st = stRef.current;

    if (st) {
      // scroll to the middle of the target project's slice; the trigger's
      // onUpdate flips the index on the way there
      const top = st.start + ((target + 0.5) / count) * (st.end - st.start);
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(top, { duration: 0.8 });
      } else {
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      setIndex(target);
      setCaseOpen(false);
    }
  };

  return (
    <section id="projects" className="relative py-24 lg:py-0" aria-label="Featured projects">
      <div
        ref={wrapperRef}
        className="relative"
        style={{ height: pinned ? `${projectsData.length * 100}vh` : undefined }}
      >
        <div
          className={
            pinned
              ? `sticky top-0 flex h-screen flex-col ${
                  caseOpen ? "justify-start overflow-y-auto py-10" : "justify-center overflow-hidden"
                }`
              : ""
          }
        >
          <div className="mx-auto w-full max-w-[1500px] px-5 md:px-8 xl:pr-20">
        <div className="mb-10 flex items-center justify-between">
          <SectionHeading title="FEATURED PROJECTS" icon={<FiFolder size={14} />} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => select(index - 1)}
              className="btn-system p-2.5"
              aria-label="Previous project"
              data-cursor="EXECUTE"
            >
              <FiArrowLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => select(index + 1)}
              className="btn-system p-2.5"
              aria-label="Next project"
              data-cursor="EXECUTE"
            >
              <FiArrowRight size={13} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[210px_minmax(0,1fr)_minmax(0,1.15fr)_240px]">
          {/* project index list */}
          <nav aria-label="Project list" className="flex flex-row flex-wrap gap-4 lg:flex-col lg:gap-6">
            {projectsData.map((p, i) => {
              const active = i === index;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => select(i)}
                  data-cursor="OPEN"
                  className="group flex items-start gap-3 text-left"
                  aria-current={active}
                >
                  <span
                    className={`font-mono text-[11px] ${active ? "text-signal" : "text-dim"}`}
                  >
                    0{i + 1}
                  </span>
                  <span className="flex flex-col">
                    <span
                      className={`sys-heading text-[13px] font-semibold tracking-[0.1em] transition-colors ${
                        active ? "text-signal text-glow-soft" : "text-muted group-hover:text-ink"
                      }`}
                    >
                      {p.title.toUpperCase()}
                    </span>
                    <span className="font-mono text-[10px] text-dim">{p.tagline}</span>
                    {active && (
                      <motion.span
                        layoutId="project-marker"
                        className="mt-2 h-px w-16 bg-signal shadow-[0_0_8px_#00ff88]"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* holographic preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
              transition={{ duration: 0.45, ease }}
            >
              <ProjectHologram kind={project.hologram} title={project.title} />
            </motion.div>
          </AnimatePresence>

          {/* description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease }}
            >
              <h3 className="sys-heading text-2xl font-bold tracking-[0.06em] text-white md:text-3xl">
                {project.title.toUpperCase()}
              </h3>
              <p className="mt-1 font-mono text-[11px] tracking-[0.14em] text-signal">
                {`${project.tagline.toUpperCase()} // ${project.duration.toUpperCase()}`}
              </p>

              <p className="mt-4 font-mono text-[12.5px] leading-relaxed text-muted">
                {project.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="border border-line bg-signal/5 px-2.5 py-1 font-mono text-[10px] tracking-[0.08em] text-ink"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {project.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 font-mono text-[11px] text-muted"
                  >
                    <span aria-hidden="true" className="mt-1 size-1 shrink-0 rounded-full bg-signal" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => setCaseOpen((v) => !v)}
                  className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-signal transition-colors hover:text-white"
                  data-cursor="OPEN"
                  aria-expanded={caseOpen}
                >
                  CASE STUDY
                  <motion.span animate={{ rotate: caseOpen ? 90 : 0 }}>
                    <FiArrowRight aria-hidden="true" />
                  </motion.span>
                </button>
                {project.links.live && (
                  <a
                    href={project.links.live}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-muted hover:text-signal"
                    data-cursor="OPEN"
                  >
                    LIVE <FiExternalLink size={11} aria-hidden="true" />
                  </a>
                )}
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-muted hover:text-signal"
                    data-cursor="OPEN"
                  >
                    CODE <FiGithub size={11} aria-hidden="true" />
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* impact panel */}
          <SysPanel title="PROJECT IMPACT" className="h-fit">
            <AnimatePresence mode="wait">
              <motion.div
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {project.metrics.slice(0, 3).map((metric) => (
                  <div key={metric.label}>
                    <p className="sys-heading normal-case text-[22px] font-bold text-signal text-glow-soft">
                      {metric.value}
                      {metric.suffix ?? ""}
                    </p>
                    <p className="font-mono text-[10px] tracking-[0.12em] text-dim">
                      {metric.label}
                    </p>
                  </div>
                ))}

                <div aria-hidden="true" className="flex h-10 items-end gap-1 pt-2">
                  {Array.from({ length: 18 }, (_, i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 bg-signal/60"
                      initial={{ height: 2 }}
                      whileInView={{
                        height: 4 + Math.abs(Math.sin(i * 2.7 + index * 5)) * 34,
                      }}
                      transition={{ delay: i * 0.03, duration: 0.4, ease }}
                      viewport={{ once: false }}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </SysPanel>
        </div>

        {/* case study drawer */}
        <AnimatePresence>
          {caseOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.55, ease }}
              className="overflow-hidden"
            >
              <div className="mt-10 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
                {(
                  [
                    ["PROBLEM", project.caseStudy.problem],
                    ["ARCHITECTURE", project.caseStudy.architecture],
                    ["RESULTS", project.caseStudy.results],
                  ] as const
                ).map(([label, text]) => (
                  <div key={label} className="bg-void/90 p-6">
                    <p className="sys-label mb-3 flex items-center gap-2">
                      <FiArrowUpRight aria-hidden="true" />
                      {label}
                    </p>
                    <p className="font-mono text-[12px] leading-relaxed text-muted">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
