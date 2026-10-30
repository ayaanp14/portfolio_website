"use client";

import dynamic from "next/dynamic";

import { Character } from "@/components/art/character";

/** The 3D model loads in its own chunk; the drawn character stands in until it does. */
export const LazyDeveloperBust = dynamic(() => import("./developer-bust").then((m) => m.DeveloperBust), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-end justify-center">
      <Character className="h-full w-auto" />
    </div>
  ),
});
