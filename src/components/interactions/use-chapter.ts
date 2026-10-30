"use client";

import { type RefObject, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useSite } from "@/lib/site-store";

gsap.registerPlugin(ScrollTrigger);

/** Marks `chapter` active while its section owns the middle of the screen. */
export function useChapter(ref: RefObject<HTMLElement | null>, chapter: number) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => {
        if (self.isActive) useSite.getState().setChapter(chapter);
      },
    });
    return () => trigger.kill();
  }, [ref, chapter]);
}
