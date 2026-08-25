"use client";

export type QualityTier = "high" | "medium" | "low";

type NavigatorCaps = Navigator & { deviceMemory?: number };

/**
 * Device capability detection — decides particle counts, DPR caps and
 * whether heavy scenes render at all. Call client-side only.
 */
export function detectQuality(): QualityTier {
  if (typeof window === "undefined") return "medium";

  const nav = navigator as NavigatorCaps;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 768;

  if (small || coarse) return memory >= 6 && cores >= 6 ? "medium" : "low";
  if (cores >= 8 && memory >= 8) return "high";
  if (cores >= 4) return "medium";
  return "low";
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const qualityPreset = {
  high: {
    globeParticles: 2600,
    haloParticles: 900,
    connections: 130,
    dpr: 2,
    arch: { braids: 3, gapParticles: 14, floorStreams: 3, floorParticles: 22, reflections: true, transmission: true },
  },
  medium: {
    globeParticles: 1600,
    haloParticles: 500,
    connections: 80,
    dpr: 1.5,
    arch: { braids: 3, gapParticles: 9, floorStreams: 3, floorParticles: 14, reflections: false, transmission: true },
  },
  low: {
    globeParticles: 800,
    haloParticles: 220,
    connections: 40,
    dpr: 1,
    arch: { braids: 2, gapParticles: 6, floorStreams: 2, floorParticles: 8, reflections: false, transmission: false },
  },
} as const;

export type ArchQuality = (typeof qualityPreset)[QualityTier]["arch"];
