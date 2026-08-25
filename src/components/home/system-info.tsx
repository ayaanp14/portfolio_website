"use client";

import { motion } from "framer-motion";

import { SysPanel } from "@/components/core/panel";
import { profile } from "@/data/profile";

/** The `// SYSTEM.INFO` key:value readout — real profile data. */
export function SystemInfo({ delay = 0 }: { delay?: number }) {
  return (
    <SysPanel title="SYSTEM.INFO">
      <ul className="space-y-2">
        {profile.systemInfo.map((row, i) => (
          <motion.li
            key={row.key}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + i * 0.12, duration: 0.4 }}
            className="flex items-start gap-2 font-mono text-[12px]"
          >
            <span aria-hidden="true" className="text-signal">
              &gt;
            </span>
            <span className="text-muted">
              {row.key}:{" "}
              <span className={"accent" in row && row.accent ? "text-signal text-glow" : "text-ink"}>
                {row.value}
              </span>
            </span>
          </motion.li>
        ))}
      </ul>
    </SysPanel>
  );
}
