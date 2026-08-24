"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight, FiGithub } from "react-icons/fi";

import { projectsData, type ProjectData } from "@/data/projects";

gsap.registerPlugin(ScrollTrigger);

function ProjectPanel({ project, index }: { project: ProjectData; index: number }) {
  const inverted = index % 2 === 1;

  return (
    <article
      data-project-panel
      className={`relative flex w-screen max-w-full shrink-0 flex-col justify-center overflow-hidden px-6 py-24 md:h-screen md:px-16 md:pb-8 md:pt-28 ${
        inverted ? "bg-ink text-paper" : "bg-paper text-ink"
      }`}
      aria-label={project.title}
    >
      {/* Oversized ghost index */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none font-display text-[38vh] font-bold leading-none opacity-[0.05] md:text-[70vh] ${
          inverted ? "text-paper" : "text-ink"
        }`}
      >
        {index + 1}
      </span>

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center gap-5">
          <span className="font-display text-sm font-bold text-accent">
            0{index + 1} / 0{projectsData.length}
          </span>
          <span className={`h-px flex-1 ${inverted ? "bg-paper/20" : "bg-line"}`} />
          <span className={`text-xs font-medium uppercase tracking-[0.3em] ${inverted ? "text-paper/50" : "text-ink/50"}`}>
            {project.role} · {project.duration}
          </span>
        </div>

        <h3
          data-panel-title
          className="font-display text-[clamp(2.8rem,8vw,6.4rem)] font-bold uppercase leading-[0.92] tracking-tight"
        >
          {project.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="font-display text-lg font-bold uppercase tracking-wide text-accent md:text-xl">
            {project.tagline}
          </p>
          {project.links.live && (
            <a
              href={project.links.live}
              target="_blank"
              rel="noreferrer"
              className="link-sweep inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-widest text-accent"
            >
              Open Live <FiArrowUpRight aria-hidden="true" />
            </a>
          )}
        </div>

        <p className={`mt-5 max-w-2xl text-sm leading-6 md:text-base md:leading-7 ${inverted ? "text-paper/70" : "text-ink/70"}`}>
          {project.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors duration-300 hover:border-accent hover:text-accent ${
                inverted ? "border-paper/25 text-paper/70" : "border-line text-ink/60"
              }`}
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6 border-t pt-6"
          style={{ borderColor: inverted ? "rgba(241,237,230,0.15)" : "var(--color-line)" }}
        >
          {project.metrics.slice(0, 3).map((metric) => (
            <div key={metric.label} className="flex flex-col gap-1">
              <span className="font-display text-2xl font-bold text-accent md:text-3xl">
                {metric.value}
                {metric.suffix ?? ""}
              </span>
              <span className={`text-[11px] font-medium uppercase tracking-[0.24em] ${inverted ? "text-paper/50" : "text-ink/50"}`}>
                {metric.label}
              </span>
            </div>
          ))}

          <div className="ml-auto flex items-center gap-6">
            {project.links.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-paper transition-transform duration-300 hover:scale-105"
              >
                Visit Live
                <FiArrowUpRight className="transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
              </a>
            )}
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noreferrer"
                className="link-sweep inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-widest"
              >
                <FiGithub aria-hidden="true" /> Source
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProjectsGallery() {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;

    if (!root || !track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {
      // Pin the section and drive the track sideways with scroll
      const distance = () => track.scrollWidth - window.innerWidth;

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // Panel titles drift against the scroll direction for depth
      gsap.utils.toArray<HTMLElement>("[data-panel-title]").forEach((title) => {
        gsap.fromTo(
          title,
          { xPercent: 6 },
          {
            xPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: title,
              containerAnimation: tween,
              start: "left right",
              end: "right left",
              scrub: true,
            },
          },
        );
      });
    });

    mm.add("(max-width: 899px)", () => {
      gsap.utils.toArray<HTMLElement>("[data-project-panel]").forEach((panel) => {
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: 60 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: panel, start: "top 82%" },
          },
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={rootRef} id="projects" aria-labelledby="projects-title" className="relative overflow-hidden">
      {/* On desktop the header floats over the pinned track so each panel
          gets the full viewport and its bottom row (metrics + live link)
          stays on screen. */}
      <div className="md:pointer-events-none md:absolute md:inset-x-0 md:top-0 md:z-20">
        <div className="container-page flex items-baseline gap-5 border-b border-line pb-5 pt-28 md:border-none md:pt-[4.5rem]">
          <span className="font-display text-xs font-bold text-accent">03</span>
          <h2 id="projects-title" className="font-display text-sm font-bold uppercase tracking-[0.35em] text-ink/60 md:mix-blend-difference md:text-[#f1ede6]">
            Selected Work
          </h2>
          <span className="ml-auto hidden text-xs uppercase tracking-[0.3em] md:block md:mix-blend-difference md:text-[#f1ede6]/60">
            Scroll — the gallery moves sideways
          </span>
        </div>
      </div>

      <div ref={trackRef} data-projects-track className="flex flex-col will-change-transform md:flex-row">
        {projectsData.map((project, index) => (
          <ProjectPanel key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
