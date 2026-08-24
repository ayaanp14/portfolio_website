"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Trailing accent ring: native cursor stays, an eased ring follows it and
 * swells over links/buttons. Fine pointers only.
 */
export function CursorDot() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;

    if (!ring || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const xTo = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });
    const scaleTo = gsap.quickTo(ring, "scale", { duration: 0.3, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      xTo(event.clientX);
      yTo(event.clientY);
    };

    const onOver = (event: PointerEvent) => {
      const interactive = (event.target as HTMLElement | null)?.closest(
        "a, button, [role='button']",
      );
      scaleTo(interactive ? 2.4 : 1);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90] -ml-3 -mt-3 hidden size-6 rounded-full border border-accent md:block"
    />
  );
}
