"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import gsap from "gsap";
import { FiArrowUpRight } from "react-icons/fi";

import { ThemeToggle } from "@/components/core/theme-toggle";
import { navigationItems } from "@/config/navigation";
import { profile } from "@/data/profile";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  useEffect(() => {
    const overlay = overlayRef.current;

    if (!overlay) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isOpen) {
      document.body.classList.add("is-locked");
      gsap
        .timeline()
        .fromTo(
          overlay,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: reduced ? 0.01 : 0.7,
            ease: "power4.inOut",
          },
        )
        .fromTo(
          overlay.querySelectorAll("[data-menu-link]"),
          { yPercent: 130, rotate: 4 },
          {
            yPercent: 0,
            rotate: 0,
            duration: reduced ? 0.01 : 0.7,
            stagger: 0.07,
            ease: "power4.out",
          },
          reduced ? 0 : "-=0.25",
        )
        .fromTo(
          overlay.querySelectorAll("[data-menu-meta]"),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: reduced ? 0.01 : 0.5, stagger: 0.06 },
          reduced ? 0 : "-=0.4",
        );
      return;
    }

    document.body.classList.remove("is-locked");
    gsap.to(overlay, {
      clipPath: "inset(0 0 100% 0)",
      duration: reduced ? 0.01 : 0.55,
      ease: "power4.inOut",
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Scroll progress hairline */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-accent"
      />

      <header className="fixed inset-x-0 top-0 z-[60] mix-blend-difference">
        <div className="flex items-center justify-between px-6 py-5 md:px-10 text-[#f1ede6]">
          <a href="#home" className="font-display text-sm font-bold uppercase tracking-[0.3em]">
            {profile.initials} — {profile.name.split(" ")[0]}
          </a>

          <div className="flex items-center gap-5">
            <ThemeToggle className="size-9 border-[#f1ede6]/60 bg-[#f1ede6]/10 text-[#f1ede6] hover:border-[#f1ede6] hover:bg-[#f1ede6]/20 hover:text-[#f1ede6]" />
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-expanded={isOpen}
              aria-controls="site-menu"
              className="font-display text-sm font-bold uppercase tracking-[0.3em]"
            >
              {isOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen menu */}
      <div
        ref={overlayRef}
        id="site-menu"
        aria-hidden={!isOpen}
        className="fixed inset-0 z-50 bg-ink text-paper"
        style={{ clipPath: "inset(0 0 100% 0)" }}
      >
        <div
          data-lenis-prevent
          className="flex h-full flex-col justify-between gap-10 overflow-y-auto px-6 pb-10 pt-24 md:px-10"
        >
          <nav aria-label="Site sections">
            <ol className="flex flex-col">
              {navigationItems.map((item, index) => (
                <li key={item.href} className="overflow-hidden border-b border-paper/15">
                  <a
                    href={item.href}
                    data-menu-link
                    onClick={() => setIsOpen(false)}
                    className="group flex items-baseline gap-5 py-2.5 will-change-transform md:py-3"
                  >
                    <span className="font-display text-xs font-medium text-accent">
                      0{index + 1}
                    </span>
                    <span className="font-display text-[clamp(1.9rem,6.5vh,4.6rem)] font-bold uppercase leading-[1.05] tracking-tight transition-transform duration-500 group-hover:translate-x-4">
                      {item.label}
                    </span>
                    <FiArrowUpRight
                      className="ml-auto size-6 opacity-0 transition-all duration-500 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div data-menu-meta className="flex flex-col gap-1 text-sm text-paper/60">
              <a href={`mailto:${profile.email}`} className="link-sweep w-fit text-paper">
                {profile.email}
              </a>
              <span>{profile.location}</span>
            </div>

            <div data-menu-meta className="flex items-center gap-5 text-sm uppercase tracking-widest">
              <a href={profile.links.github} target="_blank" rel="noreferrer" className="link-sweep">
                GitHub
              </a>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="link-sweep">
                LinkedIn
              </a>
              <ThemeToggle className="border-paper/30 text-paper hover:border-accent" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
