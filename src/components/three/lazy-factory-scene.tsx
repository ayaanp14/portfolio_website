"use client";

import dynamic from "next/dynamic";

/** The 3D factory loads in its own chunk, only in the browser. */
export const LazyFactoryScene = dynamic(() => import("./factory-scene").then((m) => m.FactoryScene), { ssr: false });
