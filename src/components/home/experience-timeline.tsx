"use client";

import { motion } from "framer-motion";
import { FiDownload } from "react-icons/fi";

import { SysPanel } from "@/components/core/panel";
import { experienceData } from "@/data/experience";
import { profile } from "@/data/profile";

/** "May 2026 - Present" → "2026 — PRESENT" */
function yearRange(duration: string): string {
  const years = duration.match(/\d{4}/g) ?? [];
  const end = /present/i.test(duration) ? "PRESENT" : years[1] ?? "";
  return `${years[0] ?? ""} — ${end}`;
}

/** `// EXPERIENCE TIMELINE` — real employment history. */
export function ExperienceTimeline() {
  return (
    <SysPanel title="EXPERIENCE TIMELINE" className="flex flex-col" bodyClassName="flex-1 p-5">
      <ol className="relative space-y-7 border-l border-line-soft pl-5">
        {experienceData.map((job, i) => (
          <motion.li
            key={job.id}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="relative"
          >
            <span
              aria-hidden="true"
              className={`absolute -left-[26px] top-1 size-2 rounded-full ${
                i === 0
                  ? "bg-signal shadow-[0_0_10px_#00ff88]"
                  : "border border-signal/60 bg-void"
              }`}
            />
            <p className="font-mono text-[11px] tracking-[0.14em] text-signal">
              {yearRange(job.duration)}
            </p>
            <h3 className="sys-heading mt-1 text-[13px] font-semibold tracking-[0.08em] text-white">
              {job.role.toUpperCase()}
            </h3>
            <p className="font-mono text-[10px] tracking-[0.1em] text-dim">
              {`${job.company.toUpperCase()} // ${job.location.toUpperCase()}`}
            </p>
            <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
              {job.description}
            </p>
          </motion.li>
        ))}
      </ol>

      <a
        href={profile.resumeUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-7 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-ink transition-colors hover:text-signal"
        data-cursor="OPEN"
      >
        DOWNLOAD RESUME <FiDownload aria-hidden="true" />
      </a>
    </SysPanel>
  );
}
