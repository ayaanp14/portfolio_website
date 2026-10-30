"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  type Group,
  LatheGeometry,
  type Material,
  type Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type MeshStandardMaterialParameters,
  type Object3D,
  Plane,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { blue } from "@/styles/palette";
import { prefersReducedMotion } from "@/lib/quality";
import { cn } from "@/lib/cn";

import { Precompile } from "./precompile";

/**
 * Ayaan as a real 3D model. One half is the finished, lit build; the other
 * half is the blueprint — dark body, glowing wireframe. The cut is a true
 * clipping plane in the model's own space, so it holds from every angle.
 *
 *   split    0..1 — how much of the body is finished (0.5 = half and half)
 *   progress { build: 0..1 } — the blueprint lines print upward as it rises
 */

export type BustProgress = { build: number };

const pointer = { x: 0, y: 0 };
const FULL: BustProgress = { build: 1 };
const HALF_WIDTH = 2.3; // the split sweeps across ±this many units

type Tone = "ink" | "hoodie" | "hoodieDark" | "hair" | "white" | "accent";
type Part = {
  geo: BufferGeometry;
  tone: Tone;
  pos?: [number, number, number];
  rot?: [number, number, number];
  scale?: [number, number, number];
};

/** The `</>` badge printed on the hoodie */
function useBadgeTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#ffffff";
    g.font = "700 150px 'JetBrains Mono', Consolas, monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("</>", 256, 136);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
}

function useParts(): Part[] {
  return useMemo(() => {
    const torsoProfile = [
      [0.001, -1.7],
      [1.82, -1.7],
      [1.8, -0.8],
      [1.7, -0.05],
      [1.38, 0.45],
      [0.82, 0.76],
      [0.46, 0.86],
      [0.001, 0.87],
    ].map(([r, y]) => new Vector2(r, y));

    const mic = new CatmullRomCurve3([
      new Vector3(-1.02, 1.78, 0.18),
      new Vector3(-0.98, 1.42, 0.58),
      new Vector3(-0.62, 1.3, 0.9),
      new Vector3(-0.3, 1.36, 0.95),
    ]);

    const lens = new RoundedBoxGeometry(0.5, 0.3, 0.1, 4, 0.08);
    const cup = new CylinderGeometry(0.34, 0.34, 0.3, 40);
    const cushion = new TorusGeometry(0.3, 0.07, 16, 40);

    return [
      // Body
      { geo: new LatheGeometry(torsoProfile, 72), tone: "hoodie", scale: [1, 1, 0.62] },
      { geo: new TorusGeometry(0.44, 0.09, 16, 48), tone: "hoodieDark", pos: [0, 0.82, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 0.72, 1] },
      { geo: new CylinderGeometry(0.3, 0.36, 0.75, 32), tone: "ink", pos: [0, 1.08, 0] },
      // Hoodie strings
      { geo: new CylinderGeometry(0.025, 0.025, 0.55, 8), tone: "white", pos: [-0.2, 0.42, 0.89], rot: [0.35, 0, 0] },
      { geo: new CylinderGeometry(0.025, 0.025, 0.5, 8), tone: "white", pos: [0.2, 0.44, 0.89], rot: [0.35, 0, 0] },
      // Head
      { geo: new SphereGeometry(1, 56, 40), tone: "ink", pos: [0, 2.05, 0], scale: [0.9, 1.02, 0.92] },
      { geo: new SphereGeometry(1.06, 56, 28, 0, Math.PI * 2, 0, Math.PI * 0.5), tone: "hair", pos: [0, 2.08, -0.02], rot: [-0.16, 0, 0], scale: [0.94, 1, 0.97] },
      // Front swoop of hair falling across the forehead
      { geo: new SphereGeometry(0.62, 40, 24), tone: "hair", pos: [-0.2, 2.62, 0.6], rot: [0.5, 0.2, 0.45], scale: [1.15, 0.42, 0.62] },
      { geo: new ConeGeometry(0.3, 0.5, 24), tone: "hair", pos: [0.32, 2.88, 0.52], rot: [1.1, 0, -0.5] },
      // Headphones
      { geo: new TorusGeometry(1.08, 0.075, 16, 72, Math.PI), tone: "ink", pos: [0, 2.0, -0.04] },
      { geo: cup, tone: "hoodie", pos: [-1.0, 1.95, 0], rot: [0, 0, Math.PI / 2] },
      { geo: cup, tone: "hoodie", pos: [1.0, 1.95, 0], rot: [0, 0, Math.PI / 2] },
      { geo: cushion, tone: "ink", pos: [-0.86, 1.95, 0], rot: [0, Math.PI / 2, 0] },
      { geo: cushion, tone: "ink", pos: [0.86, 1.95, 0], rot: [0, Math.PI / 2, 0] },
      { geo: new TubeGeometry(mic, 48, 0.035, 8), tone: "ink" },
      { geo: new SphereGeometry(0.085, 20, 20), tone: "accent", pos: [-0.3, 1.36, 0.95] },
      // Glasses
      { geo: lens, tone: "white", pos: [-0.29, 2.08, 0.83], rot: [0, -0.28, 0] },
      { geo: lens, tone: "white", pos: [0.29, 2.08, 0.83], rot: [0, 0.28, 0] },
      { geo: new RoundedBoxGeometry(0.16, 0.05, 0.05, 2, 0.02), tone: "white", pos: [0, 2.1, 0.9] },
    ];
  }, []);
}

type Cut = { local: Record<"solid" | "blue" | "scan", Plane>; world: Record<"solid" | "blue" | "scan", Plane>; line: Material };

/** Moves the cut and the print head (model space) and re-projects them to world space. */
function applyCut(cut: Cut, model: Object3D, splitX: number, build: number) {
  cut.local.solid.constant = splitX;
  cut.local.blue.constant = -splitX;
  cut.local.scan.constant = -1.8 + build * 5.2;
  cut.world.solid.copy(cut.local.solid).applyMatrix4(model.matrixWorld);
  cut.world.blue.copy(cut.local.blue).applyMatrix4(model.matrixWorld);
  cut.world.scan.copy(cut.local.scan).applyMatrix4(model.matrixWorld);
  cut.line.opacity = 0.6 * Math.min(1, build * 1.5);
}

function Bust({ split, progress }: { split: number; progress: BustProgress }) {
  const group = useRef<Group>(null);
  const parts = useParts();
  const badge = useBadgeTexture();

  // Local-space planes, re-projected into world space every frame
  const local = useMemo(
    () => ({ solid: new Plane(new Vector3(-1, 0, 0), 0), blue: new Plane(new Vector3(1, 0, 0), 0), scan: new Plane(new Vector3(0, -1, 0), 0) }),
    [],
  );
  const world = useMemo(() => ({ solid: new Plane(), blue: new Plane(), scan: new Plane() }), []);

  const mats = useMemo(() => {
    const solid = (color: string, extra: MeshStandardMaterialParameters = {}) =>
      new MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.08, clippingPlanes: [world.solid], ...extra });
    const solids: Record<Tone, Material> = {
      ink: solid("#1c1c1e", { roughness: 0.32, metalness: 0.25 }),
      hoodie: solid(blue[800], { roughness: 0.75 }),
      hoodieDark: solid(blue[950], { roughness: 0.7 }),
      hair: solid(blue[400], { roughness: 0.45 }),
      white: solid("#f7f7f7", { roughness: 0.25 }),
      accent: solid(blue[400], { emissive: blue[400], emissiveIntensity: 1.2 }),
    };
    return {
      solids,
      bpFill: new MeshBasicMaterial({ color: "#070b12", transparent: true, opacity: 0.92, clippingPlanes: [world.blue] }),
      bpLine: new MeshBasicMaterial({ color: blue[400], wireframe: true, transparent: true, opacity: 0.6, clippingPlanes: [world.blue, world.scan] }),
      badgeSolid: new MeshBasicMaterial({ map: badge, transparent: true, clippingPlanes: [world.solid] }),
      badgeBlue: new MeshBasicMaterial({ map: badge, color: blue[400], transparent: true, clippingPlanes: [world.blue] }),
      sheet: new MeshBasicMaterial({ color: blue[300], transparent: true, opacity: 0.08, side: DoubleSide, depthWrite: false }),
    };
  }, [badge, world]);

  const cut = useMemo<Cut>(() => ({ local, world, line: mats.bpLine }), [local, world, mats]);
  const sheet = useRef<Mesh>(null);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const k = 1 - Math.pow(0.03, dt);

    // Turn toward the pointer, with an idle sway and breath
    const targetY = -0.32 + pointer.x * 0.55 + Math.sin(t * 0.5) * 0.08;
    const targetX = pointer.y * 0.1;
    g.rotation.y += (targetY - g.rotation.y) * k;
    g.rotation.x += (targetX - g.rotation.x) * k;
    g.position.y = Math.sin(t * 1.3) * 0.035;
    g.updateMatrixWorld();

    // The cut and the print head live in the model's own space
    const sx = -HALF_WIDTH + split * HALF_WIDTH * 2;
    applyCut(cut, g, sx, progress.build);
    if (sheet.current) sheet.current.position.x = sx;
  });

  return (
    <group ref={group} rotation={[0, -0.32, 0]}>
      {parts.map((p, i) => (
        <group key={i} position={p.pos} rotation={p.rot} scale={p.scale}>
          <mesh geometry={p.geo} material={mats.solids[p.tone]} />
          <mesh geometry={p.geo} material={mats.bpFill} />
          <mesh geometry={p.geo} material={mats.bpLine} />
        </group>
      ))}
      {/* Chest badge, printed on both halves */}
      <mesh position={[0, -0.05, 1.1]} material={mats.badgeSolid}>
        <planeGeometry args={[0.95, 0.475]} />
      </mesh>
      <mesh position={[0, -0.05, 1.1]} material={mats.badgeBlue}>
        <planeGeometry args={[0.95, 0.475]} />
      </mesh>
      {/* A thin sheet of light marks the seam */}
      <mesh ref={sheet} rotation={[0, Math.PI / 2, 0]} position={[0, 0.8, 0]} material={mats.sheet}>
        <planeGeometry args={[2.9, 5.2]} />
      </mesh>
    </group>
  );
}

export function DeveloperBust({
  split = 0.5,
  progress = FULL,
  className,
}: {
  split?: number;
  progress?: BustProgress;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={wrap}
      role="img"
      aria-label="3D model of Ayaan: half finished build, half blueprint"
      className={cn("transition-opacity duration-700", ready ? "opacity-100" : "opacity-0", className)}
    >
      <Canvas
        frameloop={reduced ? "demand" : visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.05, 9.6], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl, camera }) => {
          gl.localClippingEnabled = true;
          camera.lookAt(0, 1.05, 0);
          setReady(true);
        }}
      >
        <hemisphereLight args={["#dbeeff", "#0a1a33", 0.9]} />
        <directionalLight position={[3, 5, 6]} intensity={2.2} />
        {/* Soft key from the front-left lifts the dark head off the stage */}
        <directionalLight position={[-3, 2.5, 7]} intensity={1.1} color="#e8f3ff" />
        {/* Blue rim light from behind picks the silhouette out of the dark */}
        <directionalLight position={[-4, 3, -5]} intensity={2.6} color={blue[400]} />
        <pointLight position={[2.5, 1, 3]} intensity={6} color={blue[300]} />
        <Bust split={split} progress={progress} />
        <Precompile />
      </Canvas>
    </div>
  );
}
