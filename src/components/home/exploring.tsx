"use client";

import { FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";

import { SysPanel } from "@/components/core/panel";
import { GenerativeScene } from "@/scenes/generative-scene";
import { profile } from "@/data/profile";

/** `// CURRENTLY EXPLORING` — generative field + focus areas. */
export function Exploring() {
  return (
    <SysPanel
      title="CURRENTLY EXPLORING"
      className="relative flex flex-col overflow-hidden"
      bodyClassName="relative flex min-h-[380px] flex-1 flex-col justify-between p-5"
    >
      <GenerativeScene className="absolute inset-0 opacity-70" />

      <div className="relative z-10">
        <h3 className="sys-heading text-[clamp(1.5rem,2.4vw,2.1rem)] font-bold leading-tight text-white">
          {profile.exploring.map((line, i) => (
            <motion.span
              key={line}
              className="block"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {line}
            </motion.span>
          ))}
        </h3>
      </div>

      <a
        href="#experience"
        className="relative z-10 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-ink transition-colors hover:text-signal"
        data-cursor="OPEN"
      >
        EXPLORE JOURNEY <FiArrowRight aria-hidden="true" />
      </a>
    </SysPanel>
  );
}
