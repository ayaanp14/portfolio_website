"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { profile } from "@/data/profile";

export const INTRO_KEY = "ap-intro-done";

/**
 * Curtain preloader: counter + name, then the two panels split apart.
 * Plays once per session.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const skip =
      sessionStorage.getItem(INTRO_KEY) === "true" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (process.env.NODE_ENV === "development" &&
        new URLSearchParams(window.location.search).get("skipLoader") === "1");

    if (skip) {
      sessionStorage.setItem(INTRO_KEY, "true");
      window.setTimeout(() => setShouldRender(false), 0);
      return;
    }

    document.body.classList.add("is-locked");
    const counter = { value: 0 };

    const failsafe = window.setTimeout(() => {
      sessionStorage.setItem(INTRO_KEY, "true");
      document.body.classList.remove("is-locked");
      setShouldRender(false);
    }, 4000);

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          window.clearTimeout(failsafe);
          sessionStorage.setItem(INTRO_KEY, "true");
          document.body.classList.remove("is-locked");
          setShouldRender(false);
        },
      });

      timeline
        .fromTo(
          "[data-intro-name] span",
          { yPercent: 120 },
          { yPercent: 0, duration: 0.7, stagger: 0.035, ease: "power4.out" },
        )
        .to(
          counter,
          {
            value: 100,
            duration: 1.4,
            ease: "power2.inOut",
            onUpdate: () => setCount(Math.round(counter.value)),
          },
          0.15,
        )
        .to("[data-intro-name] span", {
          yPercent: -120,
          duration: 0.55,
          stagger: 0.02,
          ease: "power3.in",
        })
        .to(
          "[data-intro-count]",
          { yPercent: -130, autoAlpha: 0, duration: 0.5, ease: "power3.in" },
          "<",
        )
        .to("[data-curtain='top']", {
          yPercent: -100,
          duration: 0.85,
          ease: "power4.inOut",
        })
        .to(
          "[data-curtain='bottom']",
          { yPercent: 100, duration: 0.85, ease: "power4.inOut" },
          "<",
        );
    }, root);

    return () => {
      window.clearTimeout(failsafe);
      document.body.classList.remove("is-locked");
      ctx.revert();
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100]"
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div data-curtain="top" className="absolute inset-x-0 top-0 h-1/2 bg-ink" />
      <div data-curtain="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-ink" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 text-paper">
        <p
          data-intro-name
          className="font-display overflow-hidden text-[clamp(2rem,7vw,4.5rem)] font-bold uppercase tracking-tight text-paper"
        >
          {profile.name.split("").map((char, index) => (
            <span key={index} className="inline-block will-change-transform">
              {char === " " ? " " : char}
            </span>
          ))}
        </p>
        <div className="overflow-hidden">
          <p
            data-intro-count
            className="font-display text-sm font-medium uppercase tracking-[0.4em] text-accent"
          >
            {count.toString().padStart(3, "0")}%
          </p>
        </div>
      </div>
    </div>
  );
}
