"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";

import { detectQuality, qualityPreset, type QualityTier } from "@/lib/quality";

type SceneCanvasProps = {
  children: ReactNode;
  className?: string;
  camera?: { position?: [number, number, number]; fov?: number };
  /** Extra margin before the scene wakes up when scrolling toward it */
  rootMargin?: string;
};

/**
 * Shared R3F canvas wrapper: mounts lazily when near the viewport and
 * fully pauses the render loop while offscreen. DPR follows device tier.
 */
export function SceneCanvas({
  children,
  className,
  camera,
  rootMargin = "300px",
}: SceneCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [tier, setTier] = useState<QualityTier>("medium");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTier(detectQuality());
          setMounted(true);
        }
        setActive(entry.isIntersecting);
      },
      { rootMargin },
    );

    io.observe(host);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      {mounted && (
        <Canvas
          camera={{ position: camera?.position ?? [0, 0, 5], fov: camera?.fov ?? 45 }}
          dpr={[1, qualityPreset[tier].dpr]}
          frameloop={active ? "always" : "never"}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          style={{ background: "transparent" }}
        >
          {children}
        </Canvas>
      )}
    </div>
  );
}
