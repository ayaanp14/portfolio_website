"use client";

import { useEffect } from "react";

import { prefersReducedMotion } from "@/lib/quality";

const PULL = 0.28;

/**
 * Every `.pill` leans toward the pointer while hovered. Delegated from the
 * document, and written to CSS vars so it composes with the pill's own hover.
 */
export function MagneticPills() {
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;

    const reset = (pill: HTMLElement) => {
      pill.style.removeProperty("--mx");
      pill.style.removeProperty("--my");
    };

    const onMove = (e: PointerEvent) => {
      const pill = (e.target as Element | null)?.closest<HTMLElement>(".pill");
      if (!pill) return;
      const r = pill.getBoundingClientRect();
      pill.style.setProperty("--mx", `${(e.clientX - (r.left + r.width / 2)) * PULL}px`);
      pill.style.setProperty("--my", `${(e.clientY - (r.top + r.height / 2)) * PULL}px`);
    };

    const onOut = (e: PointerEvent) => {
      const pill = (e.target as Element | null)?.closest<HTMLElement>(".pill");
      if (pill && !pill.contains(e.relatedTarget as Node | null)) reset(pill);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  return null;
}
