"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";

import { blue } from "@/styles/palette";
import { prefersReducedMotion } from "@/lib/quality";
import { cn } from "@/lib/cn";

import { Precompile } from "./precompile";

/**
 * The developer's orbit: a wireframe globe of points, tilted rings with
 * satellites and floating primitives, all in the ink + blue palette.
 * The camera leans toward the pointer and the whole system turns with scroll.
 * Rendering pauses whenever the canvas is off-screen.
 */

type Variant = "hero" | "hood";

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Shared pointer position (-1..1), read inside the render loop */
const pointer = { x: 0, y: 0 };

function Globe({ radius, count }: { radius: number; count: number }) {
  const group = useRef<Group>(null);
  const positions = useMemo(() => {
    const out = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const t = GOLDEN * i;
      out.set([Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius], i * 3);
    }
    return out;
  }, [radius, count]);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.08;
  });

  return (
    <group ref={group} rotation={[0.35, 0, 0.12]}>
      <mesh>
        <icosahedronGeometry args={[radius * 0.995, 3]} />
        <meshBasicMaterial color={blue[400]} wireframe transparent opacity={0.07} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={blue[300]} size={0.03} sizeAttenuation transparent opacity={0.7} depthWrite={false} />
      </points>
    </group>
  );
}

function Ring({ radius, tilt, speed, color }: { radius: number; tilt: [number, number, number]; speed: number; color: string }) {
  const group = useRef<Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.z += dt * speed;
  });
  return (
    <group rotation={tilt}>
      <group ref={group}>
        <mesh>
          <torusGeometry args={[radius, 0.006, 8, 160]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} />
        </mesh>
        {/* Satellite riding the ring */}
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color={blue[300]} emissive={blue[400]} emissiveIntensity={1.4} />
        </mesh>
      </group>
    </group>
  );
}

type Shape = "box" | "octa" | "torus" | "ico" | "cone";
type FloaterSpec = { shape: Shape; pos: [number, number, number]; size: number; wire?: boolean; color: string };

function Floater({ shape, pos, size, wire, color, seed }: FloaterSpec & { seed: number }) {
  const mesh = useRef<Mesh>(null);
  useFrame(({ clock }, dt) => {
    const m = mesh.current;
    if (!m) return;
    const t = clock.elapsedTime + seed * 1.7;
    m.position.y = pos[1] + Math.sin(t * 0.8) * 0.18;
    m.rotation.x += dt * (0.25 + seed * 0.03);
    m.rotation.y += dt * (0.35 - seed * 0.02);
  });
  return (
    <mesh ref={mesh} position={pos} scale={size}>
      {shape === "box" && <boxGeometry args={[1, 1, 1]} />}
      {shape === "octa" && <octahedronGeometry args={[0.75]} />}
      {shape === "torus" && <torusGeometry args={[0.55, 0.2, 16, 40]} />}
      {shape === "ico" && <icosahedronGeometry args={[0.7]} />}
      {shape === "cone" && <coneGeometry args={[0.55, 1.1, 4]} />}
      {wire ? (
        <meshBasicMaterial color={color} wireframe />
      ) : (
        <meshStandardMaterial color={color} flatShading metalness={0.35} roughness={0.35} />
      )}
    </mesh>
  );
}

const FLOATERS: Record<Variant, FloaterSpec[]> = {
  hero: [
    { shape: "box", pos: [-3.6, -0.4, -2.2], size: 0.26, color: blue[800] },
    { shape: "octa", pos: [3.5, 0.2, -0.8], size: 0.4, color: blue[400] },
    { shape: "torus", pos: [-2.8, -1.2, 0.4], size: 0.5, color: blue[300], wire: true },
    { shape: "ico", pos: [2.9, -0.9, 0.6], size: 0.46, color: blue[700] },
    { shape: "cone", pos: [-4.4, 0.1, -1.6], size: 0.4, color: blue[500], wire: true },
    { shape: "box", pos: [4.5, 0.3, -1.8], size: 0.3, color: blue[300], wire: true },
    { shape: "octa", pos: [-2.4, -2.1, -1.4], size: 0.26, color: blue[200] },
    { shape: "ico", pos: [2.5, -2.2, -1.2], size: 0.24, color: blue[400], wire: true },
  ],
  hood: [
    { shape: "box", pos: [-2.2, 1.2, 0], size: 0.34, color: blue[800] },
    { shape: "octa", pos: [2.2, 1.5, -0.2], size: 0.4, color: blue[400] },
    { shape: "torus", pos: [-2.0, -1.1, 0.3], size: 0.4, color: blue[300], wire: true },
    { shape: "ico", pos: [2.1, -0.8, 0.4], size: 0.36, color: blue[700] },
  ],
};

function Rig({ variant }: { variant: Variant }) {
  const system = useRef<Group>(null);
  useFrame(({ camera }, dt) => {
    const k = 1 - Math.pow(0.04, dt); // frame-rate independent ease
    camera.position.x += (pointer.x * 0.9 - camera.position.x) * k;
    camera.position.y += (0.2 - pointer.y * 0.6 - camera.position.y) * k;
    camera.lookAt(0, 0, 0);
    if (system.current) {
      const target = window.scrollY * 0.0009;
      system.current.rotation.y += (target - system.current.rotation.y) * k;
    }
  });

  const hero = variant === "hero";
  return (
    <group ref={system}>
      <Globe radius={hero ? 1.8 : 1.45} count={hero ? 1100 : 700} />
      <Ring radius={hero ? 2.7 : 1.95} tilt={[1.25, 0.2, 0]} speed={0.35} color={blue[400]} />
      <Ring radius={hero ? 3.2 : 2.3} tilt={[1.0, -0.5, 0.4]} speed={-0.22} color={blue[300]} />
      {hero && <Ring radius={3.7} tilt={[1.45, 0.6, -0.3]} speed={0.15} color={blue[800]} />}
      {FLOATERS[variant].map((f, i) => (
        <Floater key={i} seed={i} {...f} />
      ))}
    </group>
  );
}

export function OrbitScene({ variant = "hero", className }: { variant?: Variant; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced] = useState(prefersReducedMotion);

  // Only render frames while on screen
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={wrap}
      className={cn("pointer-events-none transition-opacity duration-[1.6s] ease-out", ready ? "opacity-100" : "opacity-0", className)}
      aria-hidden="true"
    >
      <Canvas
        frameloop={reduced ? "demand" : visible ? "always" : "never"}
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.2, 7.5], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => setReady(true)}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 5, 6]} intensity={1.6} color="#ffffff" />
        <pointLight position={[-4, -2, 3]} intensity={18} color={blue[400]} />
        <Rig variant={variant} />
        <Precompile />
      </Canvas>
    </div>
  );
}
