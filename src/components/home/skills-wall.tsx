"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { skillsData, type SkillCategory } from "@/data/skills";

gsap.registerPlugin(ScrollTrigger);

const CATEGORY_ORDER: SkillCategory[] = [
  "Frontend",
  "Backend",
  "Database",
  "Cloud & DevOps",
  "Languages",
  "Tools",
];

export function SkillsWall() {
  const rootRef = useRef<HTMLElement>(null);

  const rows = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        skills: skillsData.filter((skill) => skill.category === category),
      })).filter((row) => row.skills.length > 0),
    [],
  );

  useEffect(() => {
    const root = rootRef.current;

    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-wall-row]").forEach((row) => {
        gsap.fromTo(
          row,
          { clipPath: "inset(0 0 100% 0)", y: 40 },
          {
            clipPath: "inset(0 0 0% 0)",
            y: 0,
            duration: 0.9,
            ease: "power4.out",
            scrollTrigger: { trigger: row, start: "top 88%" },
          },
        );
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="skills" aria-labelledby="skills-title" className="relative py-28 md:py-40">
      <div className="container-page mb-14 flex items-baseline gap-5 border-b border-line pb-5">
        <span className="font-display text-xs font-bold text-accent">02</span>
        <h2 id="skills-title" className="font-display text-sm font-bold uppercase tracking-[0.35em] text-ink/60">
          Stack
        </h2>
      </div>

      <div className="flex flex-col">
        {rows.map((row, rowIndex) => (
          <div
            key={row.category}
            data-wall-row
            className="wall-row marquee-pause group border-b border-line py-2 first:border-t"
          >
            <div className="container-page flex items-center justify-between pb-1 pt-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-ink/45 transition-colors duration-300 group-hover:text-accent">
                {row.category}
              </span>
              <span className="font-display text-[11px] font-bold text-ink/30">
                {String(row.skills.length).padStart(2, "0")}
              </span>
            </div>

            <div className="overflow-hidden" aria-label={`${row.category} skills`}>
              <div
                className="marquee-track items-baseline"
                data-direction={rowIndex % 2 === 1 ? "reverse" : undefined}
                style={{ "--marquee-duration": `${26 + rowIndex * 4}s` } as React.CSSProperties}
              >
                {[0, 1].map((half) => (
                  <div key={half} className="flex shrink-0 items-baseline" aria-hidden={half === 1}>
                    {row.skills.map((skill) => (
                      <span
                        key={`${half}-${skill.id}`}
                        className="wall-word mx-5 shrink-0 font-display text-[clamp(2.4rem,6vw,4.6rem)] font-bold uppercase leading-[1.15] tracking-tight"
                      >
                        {skill.name}
                        <span className="mx-5 inline-block align-middle text-[0.4em] text-accent" aria-hidden="true">
                          ●
                        </span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
