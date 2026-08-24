"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { aboutData } from "@/data/about";

gsap.registerPlugin(ScrollTrigger);

const MANIFESTO =
  "I build SaaS products end-to-end — from database schema and secure REST APIs to real-time systems and cloud deployment. Three-plus years, two production platforms, nine hundred students taught along the way. I care about shipping things that actually work.";

export function Manifesto() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      // Words ink in one-by-one as the paragraph crosses the viewport
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.04,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-manifesto-copy]",
            start: "top 78%",
            end: "bottom 45%",
            scrub: true,
          },
        },
      );

      // Stat counters
      gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((stat) => {
        const target = Number(stat.dataset.counter ?? 0);
        const suffix = stat.dataset.suffix ?? "";
        const counter = { value: 0 };

        gsap.to(counter, {
          value: target,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: stat, start: "top 88%" },
          onUpdate: () => {
            stat.textContent = `${Math.round(counter.value)}${suffix}`;
          },
        });
      });

      // Timeline rows slide in alternately
      gsap.utils.toArray<HTMLElement>("[data-timeline-row]").forEach((row, index) => {
        gsap.fromTo(
          row,
          { autoAlpha: 0, x: index % 2 === 0 ? -60 : 60 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 85%" },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="about" aria-labelledby="about-title" className="relative py-28 md:py-40">
      <div className="container-page">
        <div className="mb-14 flex items-baseline gap-5 border-b border-line pb-5">
          <span className="font-display text-xs font-bold text-accent">01</span>
          <h2 id="about-title" className="font-display text-sm font-bold uppercase tracking-[0.35em] text-ink/60">
            About
          </h2>
        </div>

        <p
          data-manifesto-copy
          className="font-display max-w-5xl text-[clamp(1.6rem,4vw,3.2rem)] font-medium leading-[1.25] tracking-tight"
        >
          {MANIFESTO.split(" ").map((word, index) => (
            <span key={index} data-word className="inline-block">
              {word}&nbsp;
            </span>
          ))}
        </p>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
          {aboutData.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 bg-paper p-8 transition-colors duration-500 hover:bg-elevated">
              <span
                data-counter={stat.value}
                data-suffix={stat.suffix}
                className="font-display text-4xl font-bold tracking-tight text-accent md:text-5xl"
              >
                0{stat.suffix}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.22em] text-ink/55">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Journey timeline */}
        <div className="mt-24">
          <h3 className="mb-10 font-display text-sm font-bold uppercase tracking-[0.35em] text-ink/60">
            The Path
          </h3>
          <ol className="flex flex-col">
            {aboutData.timeline.map((item) => (
              <li
                key={item.year}
                data-timeline-row
                className="group grid grid-cols-[auto_1fr] items-baseline gap-6 border-b border-line py-6 will-change-transform md:grid-cols-[8rem_16rem_1fr]"
              >
                <span className="font-display text-2xl font-bold text-accent transition-transform duration-500 group-hover:-translate-y-1 md:text-3xl">
                  {item.year}
                </span>
                <span className="font-display text-lg font-bold uppercase tracking-tight">
                  {item.title}
                </span>
                <p className="col-span-2 text-sm leading-6 text-ink/60 md:col-span-1">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
