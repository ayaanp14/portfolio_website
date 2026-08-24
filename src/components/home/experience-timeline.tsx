"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { experienceData } from "@/data/experience";

gsap.registerPlugin(ScrollTrigger);

export function ExperienceTimeline() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      // Progress line draws down as the section scrolls
      gsap.fromTo(
        "[data-exp-line]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-exp-list]",
            start: "top 70%",
            end: "bottom 60%",
            scrub: true,
          },
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-exp-entry]").forEach((entry) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: entry, start: "top 80%" },
        });

        tl.fromTo(
          entry.querySelectorAll("[data-exp-head] > *"),
          { yPercent: 120 },
          { yPercent: 0, duration: 0.7, stagger: 0.06, ease: "power4.out" },
        ).fromTo(
          entry.querySelectorAll("[data-exp-item]"),
          { autoAlpha: 0, x: -24 },
          { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.07, ease: "power3.out" },
          "-=0.3",
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="experience" aria-labelledby="experience-title" className="relative py-28 md:py-40">
      <div className="container-page">
        <div className="mb-16 flex items-baseline gap-5 border-b border-line pb-5">
          <span className="font-display text-xs font-bold text-accent">04</span>
          <h2 id="experience-title" className="font-display text-sm font-bold uppercase tracking-[0.35em] text-ink/60">
            Experience
          </h2>
        </div>

        <div className="grid gap-14 md:grid-cols-[1fr_2.2fr]">
          {/* Sticky intro column */}
          <div className="md:sticky md:top-28 md:self-start">
            <p className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-bold uppercase leading-[1.02] tracking-tight">
              3+ years,
              <br />
              <span className="text-outline">products</span>
              <br />
              &amp; people.
            </p>
            <p className="mt-6 max-w-xs text-sm leading-6 text-ink/60">
              From teaching Java to 600+ students to shipping production SaaS on Azure — every
              role compounded into the next.
            </p>
          </div>

          {/* Entries with progress line */}
          <div data-exp-list className="relative pl-8 md:pl-12">
            <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px bg-line" />
            <span
              data-exp-line
              aria-hidden="true"
              className="absolute left-0 top-0 h-full w-px origin-top bg-accent"
            />

            <ol className="flex flex-col gap-16">
              {experienceData.map((job) => (
                <li key={job.id} data-exp-entry className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-8 top-2 size-2.5 -translate-x-1/2 rounded-full bg-accent md:-left-12"
                  />

                  <div data-exp-head className="overflow-hidden">
                    <p className="text-xs font-medium uppercase tracking-[0.3em] text-accent will-change-transform">
                      {job.duration} · {job.location}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight will-change-transform md:text-3xl">
                      {job.role}
                    </h3>
                    <p className="mt-1 font-display text-base font-bold text-ink/55 will-change-transform">
                      {job.company}
                    </p>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/65">{job.description}</p>

                  <ul className="mt-5 flex flex-col gap-2.5">
                    {job.achievements.map((achievement, index) => (
                      <li key={index} data-exp-item className="flex items-start gap-3 text-sm leading-6 text-ink/75">
                        <span className="mt-2.5 h-px w-5 shrink-0 bg-accent" aria-hidden="true" />
                        {achievement}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-line px-3.5 py-1 text-[11px] font-medium uppercase tracking-widest text-ink/55 transition-colors duration-300 hover:border-accent hover:text-accent"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
