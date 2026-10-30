"use client";

import { type ReactNode, useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { MotionConfig } from "framer-motion";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { setLenis } from "@/lib/lenis-store";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling driven by GSAP's ticker, kept in sync with
 * ScrollTrigger so every scrubbed animation rides the eased scroll.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Late-loading fonts change text metrics — re-measure every trigger
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Lerp (not duration) so consecutive wheel notches blend into one glide
    // instead of each restarting its own ease-out
    const lenis = new Lenis({
      lerp: 0.075,
      wheelMultiplier: 0.9,
      smoothWheel: true,
    });

    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anchor links scroll through Lenis so they inherit the easing
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );

      if (!anchor) {
        return;
      }

      const target = document.querySelector(anchor.getAttribute("href") ?? "");

      if (target) {
        event.preventDefault();
        lenis.scrollTo(target as HTMLElement, { offset: 0 });
      }
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
