"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowDown } from "react-icons/fi";

import { INTRO_KEY } from "@/components/core/preloader";
import { profile } from "@/data/profile";

gsap.registerPlugin(ScrollTrigger);

const ROLES_STRIP = [
  "Full-Stack Developer",
  "MERN Stack",
  "SaaS Builder",
  "Real-Time Systems",
  "REST APIs",
  "Cloud on Azure",
];

function Chars({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((char, index) => (
        <span key={index} data-hero-char className="inline-block will-change-transform">
          {char}
        </span>
      ))}
    </>
  );
}

export function HeroKinetic() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skipsIntro =
      sessionStorage.getItem(INTRO_KEY) === "true" ||
      (process.env.NODE_ENV === "development" &&
        new URLSearchParams(window.location.search).get("skipLoader") === "1");

    const ctx = gsap.context(() => {
      const entrance = gsap.timeline({
        defaults: { ease: "power4.out" },
        delay: reduced || skipsIntro ? 0.1 : 2.9,
      });

      entrance
        .fromTo(
          "[data-hero-char]",
          { yPercent: 120, rotate: 6 },
          {
            yPercent: 0,
            rotate: 0,
            duration: reduced ? 0.01 : 1,
            stagger: reduced ? 0 : 0.03,
          },
        )
        .fromTo(
          "[data-hero-meta], [data-hero-tagline], [data-hero-cta]",
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: reduced ? 0.01 : 0.7, stagger: 0.08 },
          reduced ? 0 : "-=0.55",
        )
        .fromTo(
          "[data-hero-strip]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: reduced ? 0.01 : 0.6 },
          reduced ? 0 : "-=0.3",
        );

      if (!reduced) {
        // Scroll out: the two title lines shear apart
        gsap.to("[data-hero-line='1']", {
          xPercent: -10,
          autoAlpha: 0.25,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-hero-line='2']", {
          xPercent: 10,
          autoAlpha: 0.25,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  const [firstName, lastName] = profile.name.split(" ");

  return (
    <section
      ref={rootRef}
      id="home"
      aria-labelledby="hero-title"
      className="relative flex min-h-screen flex-col justify-between overflow-hidden pt-24"
    >
      {/* Giant violet disc peeking from the edge */}
      <div
        aria-hidden="true"
        className="absolute -right-[18vw] top-[8vh] size-[46vw] rounded-full bg-violet/15 blur-2xl"
      />

      <div className="container-page flex flex-1 flex-col justify-center">
        <div
          data-hero-meta
          className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-[0.3em] text-ink/60"
        >
          <span className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Open to opportunities
          </span>
          <span>{profile.location}</span>
          <span className="text-accent">Full-Stack Developer (MERN)</span>
        </div>

        <h1 id="hero-title" className="font-display font-bold uppercase leading-[0.86] tracking-tight">
          <span
            data-hero-line="1"
            className="block overflow-hidden text-[clamp(4.2rem,17vw,15rem)] will-change-transform"
          >
            <Chars text={firstName} />
          </span>
          <span
            data-hero-line="2"
            className="text-outline block overflow-hidden text-[clamp(4.2rem,17vw,15rem)] will-change-transform"
          >
            <Chars text={lastName} />
          </span>
        </h1>

        <div className="mt-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <p data-hero-tagline className="max-w-xl text-base leading-7 text-ink/70 md:text-lg">
            {profile.tagline}
          </p>

          <div data-hero-cta className="flex items-center gap-4">
            <a
              href="#projects"
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-display text-sm font-bold uppercase tracking-widest text-paper transition-transform duration-300 hover:scale-105"
            >
              See Projects
              <FiArrowDown className="transition-transform duration-300 group-hover:translate-y-1" aria-hidden="true" />
            </a>
            <a
              href="#contact"
              className="link-sweep font-display text-sm font-bold uppercase tracking-widest text-ink"
            >
              Contact
            </a>
          </div>
        </div>
      </div>

      {/* Roles ticker */}
      <div
        data-hero-strip
        className="marquee-pause mt-16 w-full overflow-hidden border-y border-line py-4"
        aria-label="Roles"
      >
        <div className="marquee-track" style={{ "--marquee-duration": "22s" } as React.CSSProperties}>
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0" aria-hidden={half === 1}>
              {ROLES_STRIP.map((role) => (
                <span
                  key={`${half}-${role}`}
                  className="mx-6 flex shrink-0 items-center gap-6 font-display text-lg font-bold uppercase tracking-wide text-ink/80"
                >
                  {role}
                  <span className="text-accent" aria-hidden="true">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
