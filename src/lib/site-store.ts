"use client";

import { create } from "zustand";

import type { ThemeName } from "@/styles/palette";

type SiteState = {
  theme: ThemeName;
  /** Active chapter index (0..5) — drives nav + rail highlighting */
  chapter: number;
  /** True while the opening story is pinned (shows "Skip the story") */
  inStory: boolean;
  factoryIndex: number;
  missionIndex: number;
  setTheme: (theme: ThemeName) => void;
  setChapter: (chapter: number) => void;
  setInStory: (inStory: boolean) => void;
  setFactoryIndex: (index: number) => void;
  setMissionIndex: (index: number) => void;
};

export const useSite = create<SiteState>((set) => ({
  theme: "dark",
  chapter: 0,
  inStory: true,
  factoryIndex: 0,
  missionIndex: 0,
  setTheme: (theme) => set({ theme }),
  setChapter: (chapter) => set({ chapter }),
  setInStory: (inStory) => set({ inStory }),
  setFactoryIndex: (factoryIndex) => set({ factoryIndex }),
  setMissionIndex: (missionIndex) => set({ missionIndex }),
}));
