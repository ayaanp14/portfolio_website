"use client";

import { useEffect, useRef, useState } from "react";
import { FiGithub, FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

import { navigationItems } from "@/config/navigation";
import { profile } from "@/data/profile";
import { useSystemStore } from "@/lib/system-store";
import { scrambleText } from "@/lib/scramble";

function ScrambleLink({ label, href }: { label: string; href: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  return (
    <a
      href={href}
      className="nav-link font-mono text-[11px] tracking-[0.18em] text-muted hover:text-signal"
      data-cursor="TARGET"
      onPointerEnter={() => {
        if (ref.current) {
          cancelRef.current?.();
          cancelRef.current = scrambleText(ref.current, `_${label}`, 450);
        }
      }}
    >
      <span ref={ref}>_{label}</span>
    </a>
  );
}

export function Header() {
  const booted = useSystemStore((s) => s.booted);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={booted ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-[70] border-b border-line bg-void/70 backdrop-blur-md"
      >
        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-5 md:px-8">
          <a
            href="#home"
            className="sys-heading text-[17px] font-bold tracking-[0.1em] text-white"
            data-cursor="TARGET"
            aria-label="Ayaan Pathan — home"
          >
            {profile.initials}
            <span className="cursor-blink text-signal">_</span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {navigationItems.map((item) => (
              <ScrambleLink key={item.href} label={item.label} href={item.href} />
            ))}
            <span className="status-dot" aria-hidden="true" />
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="btn-system hidden py-2 md:inline-flex"
              data-cursor="EXECUTE"
            >
              VIEW CODE
              <FiGithub aria-hidden="true" />
            </a>
            <button
              type="button"
              className="btn-system px-3 py-2 lg:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[69] flex flex-col justify-center gap-2 bg-void/95 px-8 backdrop-blur-lg lg:hidden"
            aria-label="Mobile"
          >
            <p className="sys-label mb-6">{"// NAVIGATION"}</p>
            {navigationItems.map((item, i) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ x: -24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => setMenuOpen(false)}
                className="sys-heading border-b border-line-soft py-4 text-2xl font-semibold text-white"
              >
                <span className="mr-3 font-mono text-xs text-signal">
                  0{i + 1}
                </span>
                _{item.label}
              </motion.a>
            ))}
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="btn-system mt-8 self-start"
            >
              VIEW CODE <FiGithub aria-hidden="true" />
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
