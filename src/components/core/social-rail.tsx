"use client";

import { FiGithub, FiLinkedin, FiMail, FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";

import { profile } from "@/data/profile";
import { useSystemStore } from "@/lib/system-store";

const items = [
  { icon: FiGithub, href: profile.links.github, label: "GitHub" },
  { icon: FiLinkedin, href: profile.links.linkedin, label: "LinkedIn" },
  { icon: FiMail, href: `mailto:${profile.email}`, label: "Email" },
  { icon: FiMapPin, href: "#contact", label: "Location" },
];

/** Fixed right-edge social rail, as in the reference hero. */
export function SocialRail() {
  const booted = useSystemStore((s) => s.booted);

  return (
    <motion.aside
      initial={{ x: 60, opacity: 0 }}
      animate={booted ? { x: 0, opacity: 1 } : {}}
      transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="fixed right-5 top-1/2 z-[60] hidden -translate-y-1/2 flex-col gap-3 xl:flex"
      aria-label="Social links"
    >
      {items.map(({ icon: Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noreferrer" : undefined}
          aria-label={label}
          data-cursor="OPEN"
          className="sys-panel flex size-10 items-center justify-center text-muted transition-colors duration-200 hover:border-signal hover:text-signal"
        >
          <Icon size={15} aria-hidden="true" />
        </a>
      ))}
    </motion.aside>
  );
}
