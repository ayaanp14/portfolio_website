"use client";

import dynamic from "next/dynamic";

/** three.js is split into its own chunk and only loaded in the browser. */
export const LazyOrbitScene = dynamic(() => import("./orbit-scene").then((m) => m.OrbitScene), { ssr: false });
