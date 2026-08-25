"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Custom system cursor: central dot + trailing ring + contextual label.
 * Elements opt into labels with data-cursor="TARGET|EXECUTE|OPEN|INSPECT".
 * Fine pointers only — touch devices keep native behavior.
 */
export function SystemCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;

    if (!dot || !ring || !label) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.setAttribute("data-cursor-active", "");

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
    const ringScale = gsap.quickTo(ring, "scale", { duration: 0.3, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const tagged = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, [role='button'], input, textarea");
      const text = tagged?.dataset.cursor ?? "";

      label.textContent = text;
      gsap.to(label, { opacity: text ? 1 : 0, duration: 0.2 });
      ringScale(text ? 2.6 : interactive ? 1.8 : 1);
      gsap.to(ring, {
        borderColor: interactive || text ? "#00ff88" : "rgba(0,255,136,0.5)",
        duration: 0.2,
      });
    };

    const onDown = () => ringScale(0.8);
    const onUp = () => ringScale(1);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      document.documentElement.removeAttribute("data-cursor-active");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div aria-hidden="true" className="system-cursor">
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[95] -ml-[3px] -mt-[3px] size-1.5 rounded-full bg-signal shadow-[0_0_8px_#00ff88]"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[94] -ml-4 -mt-4 flex size-8 items-center justify-center rounded-full border border-signal/50"
      >
        <span
          ref={labelRef}
          className="absolute top-full mt-1 font-mono text-[8px] tracking-[0.2em] text-signal opacity-0"
        />
      </div>
    </div>
  );
}
