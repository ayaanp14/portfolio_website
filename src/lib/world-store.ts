"use client";

import { create } from "zustand";

import type { ThemeName } from "@/styles/palette";

export type HoodMode = "front" | "back";

type WorldState = {
  theme: ThemeName;
  /** Active chapter index (0..5) — drives nav highlighting */
  chapter: number;
  /** Continuous scroll position through the world: chapter + progress (0..6) */
  journey: number;
  /** Position along the street: -1 intro, 0..n-1 projects, n outro */
  street: number;
  hoveredProject: number | null;
  factoryIndex: number;
  hoodMode: HoodMode;
  missionIndex: number;
  /** Set once the WebGL world has rendered its first frame */
  worldReady: boolean;
  setTheme: (theme: ThemeName) => void;
  setChapter: (chapter: number) => void;
  setJourney: (journey: number) => void;
  setStreet: (street: number) => void;
  setHoveredProject: (index: number | null) => void;
  setFactoryIndex: (index: number) => void;
  setHoodMode: (mode: HoodMode) => void;
  setMissionIndex: (index: number) => void;
  setWorldReady: (ready: boolean) => void;
};

export const useWorld = create<WorldState>((set) => ({
  theme: "dark",
  chapter: 0,
  journey: 0,
  street: -1,
  hoveredProject: null,
  factoryIndex: 0,
  hoodMode: "front",
  missionIndex: 0,
  worldReady: false,
  setTheme: (theme) => set({ theme }),
  setChapter: (chapter) => set({ chapter }),
  setJourney: (journey) => set({ journey }),
  setStreet: (street) => set({ street }),
  setHoveredProject: (hoveredProject) => set({ hoveredProject }),
  setFactoryIndex: (factoryIndex) => set({ factoryIndex }),
  setHoodMode: (hoodMode) => set({ hoodMode }),
  setMissionIndex: (missionIndex) => set({ missionIndex }),
  setWorldReady: (worldReady) => set({ worldReady }),
}));

/**
 * Pointer position in normalised device coords (-1..1). Mutable and outside
 * React so per-frame readers never trigger renders.
 */
export const pointer = { x: 0, y: 0 };
