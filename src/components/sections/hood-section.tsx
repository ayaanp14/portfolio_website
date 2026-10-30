"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

import { profile } from "@/data/profile";
import { aboutData } from "@/data/about";
import { experienceData } from "@/data/experience";
import { skillsData } from "@/data/skills";
import { useChapter } from "@/components/interactions/use-chapter";
import { LazyDeveloperBust } from "@/components/three/lazy-developer-bust";
import { LazyOrbitScene } from "@/components/three/lazy-orbit-scene";
import { CountUp, Reveal, RevealHeading, staggerChild, staggerParent } from "@/components/ui/reveal";

const FRONT = skillsData.filter((s) => s.category === "Frontend" || s.id === "javascript");
const BACK = skillsData.filter((s) => ["Backend", "Database", "Cloud & DevOps"].includes(s.category));

function SkillColumn({ title, skills, weight }: { title: string; skills: typeof skillsData; weight: number }) {
  return (
    <div style={{ opacity: 0.35 + weight * 0.65 }} className="transition-opacity duration-300">
      <p className="label text-ink">{title}</p>
      <motion.ul
        className="mt-3 flex flex-wrap gap-1.5"
        variants={staggerParent}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "-10% 0px" }}
      >
        {skills.map((s) => {
          const Icon = s.icon;
          return (
            <motion.li key={s.id} variants={staggerChild} className="tag" title={s.description}>
              <Icon aria-hidden="true" className="text-accent" /> {s.name}
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}

function ApproachEditor() {
  return (
    <figure className="code-editor overflow-hidden rounded-lg">
      <figcaption className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-[11px] text-muted">engineering-approach.ts</span>
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-blue-400" />
        </span>
      </figcaption>
      <pre className="overflow-x-auto p-4">
        <code>
          <span className="k">const</span> <span className="p">ayaan</span> = {"{"}
          {"\n  "}
          <span className="p">role</span>: <span className="s">&quot;Full-Stack Developer&quot;</span>,
          {"\n  "}
          <span className="p">approach</span>: [
          {"\n    "}
          <span className="s">&quot;schema first&quot;</span>, <span className="c">{"// TrueHostel"}</span>
          {"\n    "}
          <span className="s">&quot;validate every request&quot;</span>, <span className="c">{"// zod, 17+ route groups"}</span>
          {"\n    "}
          <span className="s">&quot;realtime by design&quot;</span>, <span className="c">{"// Socket.IO"}</span>
          {"\n    "}
          <span className="s">&quot;automate the release&quot;</span>, <span className="c">{"// Actions → Azure"}</span>
          {"\n  "}],
          {"\n  "}
          <span className="p">shipping</span>: <span className="k">true</span>,{"\n"}
          {"}"};<span className="caret" />
        </code>
      </pre>
    </figure>
  );
}

export function HoodSection() {
  const root = useRef<HTMLElement>(null);
  const [value, setValue] = useState(50);
  useChapter(root, 3);

  const [lead, rest] = [
    "Software developer in Indore, building products end to end:",
    "from database schema and secure REST APIs to realtime systems and cloud deployments.",
  ];

  return (
    <section id="hood" ref={root} data-tone-left="theme" data-tone-right="theme" aria-label="04 — Under the Hood: about Ayaan" className="relative bg-bg py-[14vh]">
      <div className="px-[4vw]">
        <Reveal y={12}>
          <p className="eyebrow">
            <b>04</b>Under the Hood
          </p>
        </Reveal>
        <RevealHeading
          lines={[["Who builds behind"], [{ text: "the screen?", em: true }]]}
          className="mt-4 text-[clamp(2.2rem,6vw,5.6rem)]"
        />

        <div className="mt-14 grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Character on the pedestal */}
          <div className="relative mx-auto flex w-full max-w-md flex-col items-center lg:sticky lg:top-[14vh] lg:col-span-5" aria-hidden="true">
            <LazyOrbitScene variant="hood" className="absolute -inset-x-[30%] -top-[12%] bottom-[8%]" />
            <div className="pulse-dot absolute -top-10 left-1/2 h-[110%] w-[80%] -translate-x-1/2 [animation-duration:4s] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--blue-400)_16%,transparent),transparent_85%)] [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />
            <div className="relative aspect-[11/10] h-[min(56vh,480px)]">
              <LazyDeveloperBust split={1 - value / 100} className="h-full w-full" />
            </div>
            <div className="relative -mt-px h-0 w-[92%] border-b-[56px] border-x-[40px] border-x-transparent border-b-surface-3">
              <span className="absolute -top-px left-0 right-0 h-[3px] bg-accent" />
            </div>
          </div>

          {/* Player card */}
          <Reveal className="lg:col-span-7">
            <article data-tilt="3" className="tone-light overflow-hidden rounded-xl border border-line bg-surface">
              <div className="h-2.5 bg-[repeating-linear-gradient(-45deg,var(--blue-800)_0_8px,var(--blue-900)_8px_16px)]" />
              <div className="p-6 md:p-10">
                <div className="flex items-center justify-between gap-4">
                  <span className="label">Player 01</span>
                  <span className="label inline-flex items-center gap-2 text-ink">
                    <span className="pulse-dot size-1.5 rounded-full bg-accent" aria-hidden="true" />
                    Available for work
                  </span>
                </div>
                <h3 className="display mt-5 text-[clamp(2.2rem,5vw,4.4rem)]">{profile.name}</h3>
                <p className="label mt-3 !text-accent">Software developer · Full stack developer · Product builder</p>
                <p className="mt-6 text-[clamp(1.1rem,1.6vw,1.45rem)] leading-snug">
                  {lead} <span className="text-faint">{rest}</span>
                </p>
                <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">{experienceData[0].description}</p>

                <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-lg border border-line-strong">
                  {aboutData.stats.map((s, i) => (
                    <div
                      key={s.label}
                      className={`flex items-center justify-between gap-3 p-4 md:p-5 ${i % 2 === 0 ? "border-r border-line-strong" : ""} ${i < 2 ? "border-b border-line-strong" : ""}`}
                    >
                      <dt className="label text-[10px] leading-snug">{s.label}</dt>
                      <dd className="display text-[clamp(1.3rem,2.4vw,2rem)]">
                        <CountUp to={s.value} suffix={s.suffix} />
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-8 flex items-center gap-4">
                  <label htmlFor="split" className="label">
                    Front
                  </label>
                  <input
                    id="split"
                    type="range"
                    min={0}
                    max={100}
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="split-range"
                    style={{ ["--fill" as string]: `${value}%` }}
                    aria-valuetext={value < 40 ? "Mostly front-end" : value > 60 ? "Mostly back-end" : "Both sides"}
                  />
                  <span className="label">Back</span>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <SkillColumn title="Front — what people see" skills={FRONT} weight={1 - value / 100} />
                  <SkillColumn title="Back — what makes it work" skills={BACK} weight={value / 100} />
                </div>
              </div>
            </article>
          </Reveal>
        </div>

        {/* Background, education, approach */}
        <div className="mt-20 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="h-full rounded-xl border border-line p-6 md:p-8">
              <h3 className="label text-ink">Professional background</h3>
              <ol className="mt-5 space-y-5">
                {experienceData.map((e) => (
                  <li key={e.id} className="grid grid-cols-[1fr_auto] gap-x-4 border-t border-line pt-4">
                    <div>
                      <p className="font-semibold">{e.role}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {e.company} · {e.location}
                      </p>
                    </div>
                    <p className="label whitespace-nowrap text-[10px]">{e.duration}</p>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-3" delay={0.1}>
            <div className="flex h-full flex-col gap-8 rounded-xl border border-line p-6 md:p-8">
              <div>
                <h3 className="label text-ink">Education</h3>
                <p className="mt-4 font-semibold">B.Tech, Computer Science (Data Science)</p>
                <p className="mt-1 text-sm text-muted">LNCT Bhopal · from 2020</p>
                <p className="mt-3 text-sm text-muted">Class XII — 92%</p>
              </div>
              <div>
                <h3 className="label text-ink">Exploring</h3>
                <p className="display mt-4 text-xl leading-tight">{profile.exploring.join(" ")}</p>
              </div>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-4" delay={0.2}>
            <div className="flex h-full flex-col gap-4">
              <h3 className="label text-ink">Engineering approach</h3>
              <ApproachEditor />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
