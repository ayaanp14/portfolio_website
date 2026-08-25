"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiGithub, FiChevronRight } from "react-icons/fi";

import { ParticleGlobe } from "@/scenes/particle-globe";
import { SystemInfo } from "@/components/home/system-info";
import { LiveStatus } from "@/components/home/live-status";
import { Magnetic } from "@/components/motion/magnetic";
import { profile } from "@/data/profile";
import { useSystemStore } from "@/lib/system-store";

gsap.registerPlugin(ScrollTrigger);

/** Split a word into per-character spans for the reconstruction reveal. */
function Chars({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <span key={i} data-char className="inline-block will-change-transform">
          {ch}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useRef(0);
  const bootedRef = useRef(false);
  const booted = useSystemStore((s) => s.booted);

  useEffect(() => {
    bootedRef.current = booted;
  }, [booted]);

  // Hero exit progress drives the globe's scroll response
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    return () => st.kill();
  }, []);

  // Typography reconstruction once the system boots
  useEffect(() => {
    if (!booted || !copyRef.current) return;
    const chars = copyRef.current.querySelectorAll("[data-char]");
    const rest = copyRef.current.querySelectorAll("[data-reveal]");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        chars,
        { yPercent: 110, opacity: 0, filter: "blur(6px)" },
        {
          yPercent: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.85,
          stagger: 0.035,
          ease: "power3.out",
        },
        0.15,
      );
      tl.fromTo(
        rest,
        { y: 26, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" },
        0.55,
      );
    }, copyRef);

    return () => ctx.revert();
  }, [booted]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden pt-14"
      aria-label="Introduction"
    >
      {/* 3D particle globe — the world behind the interface */}
      <ParticleGlobe
        scrollRef={scrollProgress}
        bootedRef={bootedRef}
        className="absolute inset-0 h-full w-full"
      />

      {/* section index marker */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-5 top-1/3 hidden flex-col items-center gap-3 md:flex"
      >
        <span className="font-mono text-[10px] text-dim">01</span>
        <span className="h-16 w-px bg-gradient-to-b from-signal/60 to-transparent" />
      </div>

      <div className="pointer-events-none relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-10 px-5 md:px-14 lg:grid-cols-[1.2fr_0.8fr_minmax(280px,0.55fr)] lg:items-center xl:pr-20">
        {/* left: identity */}
        <div ref={copyRef} className={booted ? "" : "opacity-0"}>
          <p data-reveal className="sys-label mb-6 flex items-center gap-2">
            <span className="status-dot" />
            {"// SYSTEM ONLINE"}
          </p>

          <h1 className="sys-heading text-[clamp(3.2rem,9vw,6.8rem)] font-bold leading-[0.95] text-white">
            <span className="block overflow-hidden">
              <Chars text={profile.firstName} />
            </span>
            <span className="block overflow-hidden">
              <Chars text={profile.lastName} />
              <span data-char className="cursor-blink inline-block text-signal">
                _
              </span>
            </span>
          </h1>

          <p
            data-reveal
            className="mt-5 font-mono text-[13px] font-semibold tracking-[0.32em] text-signal text-glow-soft"
          >
            {profile.role}
          </p>

          <p data-reveal className="mt-6 max-w-md font-mono text-[13px] leading-relaxed text-muted">
            {profile.heroLine}
          </p>

          <div data-reveal className="pointer-events-auto mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <a href="#projects" className="btn-system" data-cursor="EXECUTE">
                <FiChevronRight aria-hidden="true" />
                EXPLORE MY WORK
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={profile.links.github}
                target="_blank"
                rel="noreferrer"
                className="btn-system btn-ghost"
                data-cursor="OPEN"
              >
                VIEW CODE
                <FiGithub aria-hidden="true" />
              </a>
            </Magnetic>
          </div>
        </div>

        {/* middle column intentionally open — the globe lives here */}
        <div aria-hidden="true" className="hidden lg:block" />

        {/* right: system panels */}
        <div className="pointer-events-auto flex flex-col gap-4">
          {booted && (
            <>
              <SystemInfo delay={0.7} />
              <LiveStatus />
            </>
          )}
        </div>
      </div>

      {/* scroll indicator */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-7 left-5 hidden items-center gap-3 md:flex md:px-9"
      >
        <span className="font-mono text-[10px] tracking-[0.24em] text-dim">SCROLL</span>
        <span className="relative h-8 w-5 rounded-full border border-line-soft">
          <span className="absolute left-1/2 top-1.5 h-1.5 w-px -translate-x-1/2 animate-bounce bg-signal" />
        </span>
      </div>
    </section>
  );
}
