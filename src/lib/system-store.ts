"use client";

import { create } from "zustand";

type SystemState = {
  /** True once the boot sequence has fully completed and the UI is revealed */
  booted: boolean;
  /** 0..1 boot progress, drives the preloader */
  bootProgress: number;
  setBooted: (booted: boolean) => void;
  setBootProgress: (progress: number) => void;
};

export const useSystemStore = create<SystemState>((set) => ({
  booted: false,
  bootProgress: 0,
  setBooted: (booted) => set({ booted }),
  setBootProgress: (bootProgress) => set({ bootProgress }),
}));
