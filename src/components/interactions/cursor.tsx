"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

import { prefersReducedMotion } from "@/lib/quality";

const INTERACTIVE = "a, button, [role=radio], input, label";

/**
 * A dot that tracks the pointer and a ring that trails it. The ring swells
 * over anything clickable and shows a label over elements with
 * `data-cursor="Label"`. Blend mode keeps it visible on both halves.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const d = dot.current;
    const r = ring.current;
    const l = label.current;
    if (!d || !r || !l || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;

    gsap.set([d, r], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3.out" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3.out" });
    const rx = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3.out" });
    let shown = false;
    let mode = "";

    const setMode = (next: string, text = "") => {
      if (next === mode) return;
      mode = next;
      l.textContent = text;
      gsap.to(r, {
        scale: next === "label" ? 2.6 : next === "hover" ? 1.8 : 1,
        backgroundColor: next === "label" ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
        duration: 0.45,
        ease: "power3.out",
      });
      gsap.to(d, { scale: next ? 0 : 1, duration: 0.3 });
      gsap.to(l, { autoAlpha: next === "label" ? 1 : 0, duration: 0.25 });
    };

    const onMove = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);

      const target = e.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      if (labelled) setMode("label", labelled.dataset.cursor);
      else if (target?.closest(INTERACTIVE)) setMode("hover");
      else setMode("");
    };
    const onLeave = () => {
      shown = false;
      gsap.to([d, r], { autoAlpha: 0, duration: 0.3 });
    };
    const onDown = () => gsap.to(r, { scale: "-=0.3", duration: 0.15 });
    const onUp = () => {
      const m = mode;
      mode = "_";
      setMode(m, l.textContent ?? "");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[120] mix-blend-difference" aria-hidden="true">
      <div ref={ring} className="invisible absolute left-0 top-0 flex size-9 items-center justify-center rounded-full border border-white">
        <span ref={label} className="invisible font-mono text-[5px] font-semibold uppercase tracking-[0.18em] text-black" />
      </div>
      <div ref={dot} className="invisible absolute left-0 top-0 size-1.5 rounded-full bg-white" />
    </div>
  );
}
