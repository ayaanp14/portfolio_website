"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Color,
  ExtrudeGeometry,
  type Group,
  MeshPhysicalMaterial,
  type MeshPhysicalMaterialParameters,
  MeshStandardMaterial,
  PMREMGenerator,
  RepeatWrapping,
  type Scene,
  Shape,
  SRGBColorSpace,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { factoryModules, type FactoryModule, type FactoryModuleKind } from "@/data/factory";
import { blue } from "@/styles/palette";
import { cn } from "@/lib/cn";

import { factoryState } from "./factory-progress";
import { Precompile } from "./precompile";

/**
 * THE FACTORY in 3D — styled as a clean product render: studio reflections,
 * soft contact shadows, glossy white crates with inset display panels.
 * The module under the press turns brand blue and gets stamped.
 * Scroll drives `factoryState.progress` (0..1); the scene reads it each frame.
 */

const N = factoryModules.length;
const SPACING = 3.4;
const CRATE = 1.6;
const BELT_LEN = (N - 1) * SPACING + 40;
const pointer = { x: 0, y: 0 };

const WHITE = new Color("#f3f6fa");
const BRAND = new Color(blue[800]);

/* ------------------------------------------------------------------ */
/* Helpers kept outside components so the frame loop can mutate freely */
/* ------------------------------------------------------------------ */

function approach<T extends object>(o: T, key: keyof T, target: number, k: number) {
  const cur = o[key] as unknown as number;
  (o as Record<keyof T, number>)[key] = cur + (target - cur) * k;
}

function applyEnvironment(scene: Scene, env: Texture | null) {
  scene.environment = env;
}

function moveTexture(t: Texture, by: number) {
  t.offset.x = by;
}

function tintToward(m: MeshPhysicalMaterial, on: boolean, k: number) {
  m.color.lerp(on ? BRAND : WHITE, k);
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Inset display panel on the crate's front: number + title */
function panelTexture(m: FactoryModule) {
  return canvasTexture(512, 512, (g) => {
    g.fillStyle = "#0e131a";
    g.beginPath();
    g.roundRect(0, 0, 512, 512, 56);
    g.fill();
    g.fillStyle = blue[400];
    g.font = "600 64px 'JetBrains Mono', Consolas, monospace";
    g.textAlign = "center";
    g.fillText(m.number, 256, 210);
    g.fillStyle = "#eef3f9";
    g.font = "600 36px 'JetBrains Mono', Consolas, monospace";
    const words = m.title.toUpperCase().split(" ");
    const lines = words.length > 2 ? [words.slice(0, 2).join(" "), words.slice(2).join(" ")] : words.length === 2 ? words : [words[0]];
    lines.forEach((l, i) => g.fillText(l, 256, 300 + i * 52));
  });
}

/** Fine moving lines on the belt surface */
function beltTexture() {
  const t = canvasTexture(128, 64, (g) => {
    g.fillStyle = "#0b0d11";
    g.fillRect(0, 0, 128, 64);
    g.fillStyle = "#1a1f27";
    g.fillRect(0, 0, 4, 64);
  });
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(BELT_LEN / 0.6, 1);
  return t;
}

/** Light runners along the belt edges */
function runnerTexture() {
  const t = canvasTexture(128, 8, (g) => {
    g.fillStyle = "#000000";
    g.fillRect(0, 0, 128, 8);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 54, 8);
  });
  t.wrapS = RepeatWrapping;
  t.repeat.set(BELT_LEN / 1.1, 1);
  return t;
}

function gearGeometry(teeth: number, outer: number, inner: number, depth: number) {
  const s = new Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    (
      [
        [inner, a],
        [outer, a + step * 0.15],
        [outer, a + step * 0.45],
        [inner, a + step * 0.6],
      ] as const
    ).forEach(([r, ang], j) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0 && j === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    });
  }
  s.closePath();
  const hole = new Shape();
  hole.absarc(0, 0, inner * 0.32, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const geo = new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 3 });
  geo.center();
  return geo;
}

const glossy = (color: string, extra: MeshPhysicalMaterialParameters = {}) =>
  new MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.15, ...extra });

/* ------------------------------------------------------------------ */
/* Studio                                                              */
/* ------------------------------------------------------------------ */

/** Soft studio reflections from three's built-in room environment */
function StudioEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    applyEnvironment(scene, env);
    return () => {
      applyEnvironment(scene, null);
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

/** A small glossy model of each module, riding on top of its crate */
function Emblem({ kind, on }: { kind: FactoryModuleKind; on: boolean }) {
  const glow = useMemo(() => new MeshStandardMaterial({ color: blue[400], emissive: blue[400], emissiveIntensity: 0.4, roughness: 0.3 }), []);
  const white = useMemo(() => glossy("#f5f7fa"), []);
  const brand = useMemo(() => glossy(blue[800]), []);
  const gear = useMemo(() => gearGeometry(10, 0.5, 0.38, 0.22), []);

  useFrame(() => approach(glow, "emissiveIntensity", on ? 2.2 : 0.5, 0.08));

  switch (kind) {
    case "screens":
      return (
        <group>
          <mesh material={white} position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[1.1, 0.7, 0.08]} />
          </mesh>
          <mesh material={glow} position={[0, 0.5, 0.042]}>
            <planeGeometry args={[0.96, 0.54]} />
          </mesh>
          <mesh material={white} position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.22, 16]} />
          </mesh>
          <mesh material={brand} position={[0, -0.02, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.3, 0.05, 32]} />
          </mesh>
        </group>
      );
    case "servers":
      return (
        <group>
          {[0, 1, 2].map((r) => (
            <group key={r} position={[0, r * 0.28, 0]}>
              <mesh material={r === 1 ? brand : white} castShadow>
                <boxGeometry args={[0.95, 0.23, 0.62]} />
              </mesh>
              <mesh material={glow} position={[-0.32, 0, 0.315]}>
                <sphereGeometry args={[0.04, 16, 16]} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "database":
      return (
        <group>
          {[0, 1, 2].map((r) => (
            <mesh key={r} material={r === 1 ? glow : r === 2 ? white : brand} position={[0, r * 0.28, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.23, 48]} />
            </mesh>
          ))}
        </group>
      );
    case "gateway": {
      const nodes: [number, number, number][] = [
        [0.42, 0.66, 0],
        [-0.42, 0.42, 0.1],
        [0.38, 0.12, -0.1],
      ];
      return (
        <group position={[0, 0.04, 0]}>
          <mesh material={glow} position={[0, 0.38, 0]} castShadow>
            <sphereGeometry args={[0.17, 32, 32]} />
          </mesh>
          {nodes.map((p, i) => {
            const dx = p[0];
            const dy = p[1] - 0.38;
            return (
              <group key={i}>
                <mesh material={i === 1 ? brand : white} position={p} castShadow>
                  <sphereGeometry args={[0.13, 32, 32]} />
                </mesh>
                <mesh material={white} position={[dx / 2, 0.38 + dy / 2, p[2] / 2]} rotation={[0, 0, Math.atan2(dy, dx) - Math.PI / 2]}>
                  <cylinderGeometry args={[0.025, 0.025, Math.hypot(dx, dy), 10]} />
                </mesh>
              </group>
            );
          })}
        </group>
      );
    }
    case "cloud":
      return (
        <group position={[0, 0.3, 0]}>
          {(
            [
              [0, 0.12, 0, 0.32],
              [-0.34, 0, 0, 0.24],
              [0.35, 0, 0, 0.26],
              [0.12, 0.28, 0, 0.24],
            ] as const
          ).map(([x, y, z, r], i) => (
            <mesh key={i} material={white} position={[x, y, z]} castShadow>
              <sphereGeometry args={[r, 40, 40]} />
            </mesh>
          ))}
          <mesh material={glow} position={[0, 0.02, 0.24]}>
            <sphereGeometry args={[0.09, 20, 20]} />
          </mesh>
        </group>
      );
    case "gears":
      return (
        <group position={[0, 0.5, 0]}>
          <mesh geometry={gear} material={white} castShadow />
          <mesh material={glow} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.28, 24]} />
          </mesh>
        </group>
      );
  }
}

function Crate({ module: m, index, active, onSelect }: { module: FactoryModule; index: number; active: boolean; onSelect: (i: number) => void }) {
  const group = useRef<Group>(null);
  const emblem = useRef<Group>(null);
  const shell = useMemo(() => glossy("#f3f6fa"), []);
  const panel = useMemo(() => {
    const map = panelTexture(m);
    return new MeshStandardMaterial({ map, roughness: 0.25, metalness: 0.1, emissive: "#ffffff", emissiveMap: map, emissiveIntensity: 0.25 });
  }, [m]);
  const geo = useMemo(() => new RoundedBoxGeometry(CRATE, CRATE, CRATE, 5, 0.14), []);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.pow(0.002, dt);
    g.position.y += ((active ? CRATE / 2 + 0.16 : CRATE / 2) - g.position.y) * k;
    tintToward(shell, active, k);
    approach(panel, "emissiveIntensity", active ? 0.55 : 0.25, k);
    if (emblem.current) {
      emblem.current.rotation.y += dt * (active ? 1.1 : 0.25);
      emblem.current.position.y = CRATE / 2 + 0.04 + (active ? Math.sin(clock.elapsedTime * 2.2) * 0.06 + 0.08 : 0);
    }
  });

  return (
    <group ref={group} position={[index * SPACING, CRATE / 2, 0]}>
      <mesh
        geometry={geo}
        material={shell}
        castShadow
        receiveShadow
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(index);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => (document.body.style.cursor = "")}
      />
      <mesh material={panel} position={[0, 0, CRATE / 2 + 0.002]}>
        <planeGeometry args={[1.22, 1.22]} />
      </mesh>
      <group ref={emblem} position={[0, CRATE / 2 + 0.04, 0]} scale={0.85}>
        <Emblem kind={m.kind} on={active} />
      </group>
    </group>
  );
}

/** A single-arm press reaching over the belt from behind */
function Press({ active }: { active: number }) {
  const head = useRef<Group>(null);
  const started = useRef(-10);
  const now = useRef(0);
  // Stamp when a crate arrives under the press (not when it leaves)
  useEffect(() => {
    if (active >= 0) started.current = now.current;
  }, [active]);

  const graphite = useMemo(() => glossy("#232831", { roughness: 0.4, metalness: 0.3 }), []);
  const white = useMemo(() => glossy("#f5f7fa"), []);
  const ring = useMemo(() => new MeshStandardMaterial({ color: blue[400], emissive: blue[400], emissiveIntensity: 2.2 }), []);

  useFrame(({ clock }) => {
    now.current = clock.elapsedTime;
    const t = clock.elapsedTime - started.current;
    // Slam down fast, spring back up
    let drop = 0;
    if (t < 0.18) drop = (t / 0.18) ** 2;
    else if (t < 0.9) {
      const u = (t - 0.18) / 0.72;
      drop = Math.exp(-5 * u) * Math.cos(u * 9);
    }
    if (head.current) head.current.position.y = -Math.max(-0.15, drop) * 0.5;
    approach(ring, "emissiveIntensity", 1.6 + drop * 2.5, 1);
  });

  return (
    <group>
      {/* Column behind the belt */}
      <mesh material={graphite} position={[0, 1.9, -2.1]} castShadow>
        <boxGeometry args={[0.5, 4.6, 0.5]} />
      </mesh>
      {/* Arm reaching forward */}
      <mesh material={graphite} position={[0, 4.05, -1.05]} castShadow>
        <boxGeometry args={[0.5, 0.36, 2.6]} />
      </mesh>
      <mesh material={ring} position={[0, 4.05, 0.26]}>
        <boxGeometry args={[0.52, 0.06, 0.06]} />
      </mesh>
      <group ref={head}>
        <mesh material={white} position={[0, 3.6, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.6, 24]} />
        </mesh>
        <mesh material={white} position={[0, 3.25, 0]} castShadow>
          <cylinderGeometry args={[0.62, 0.66, 0.24, 48]} />
        </mesh>
        <mesh material={ring} position={[0, 3.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.035, 12, 64]} />
        </mesh>
      </group>
    </group>
  );
}

function Factory({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  const crates = useRef<Group>(null);
  const textures = useMemo(() => ({ belt: beltTexture(), runner: runnerTexture() }), []);
  const belt = useMemo(() => new RoundedBoxGeometry(BELT_LEN, 0.42, 2.7, 4, 0.16), []);
  const beltMat = useMemo(() => glossy("#161a20", { roughness: 0.55, clearcoat: 0.3, envMapIntensity: 0.4 }), []);
  const runnerMat = useMemo(
    () => new MeshStandardMaterial({ color: "#0b1220", emissive: blue[400], emissiveMap: textures.runner, emissiveIntensity: 1.6 }),
    [textures],
  );

  useFrame(({ camera, size }, dt) => {
    // The section's stepped timeline already eases each move — follow it exactly
    const d = factoryState.progress * (N - 1) * SPACING;
    if (crates.current) crates.current.position.x = -d;
    moveTexture(textures.belt, d / 0.6);
    moveTexture(textures.runner, d / 1.1);

    // Frame the belt for any aspect ratio, lean gently toward the pointer
    const aspect = size.width / size.height;
    const back = Math.max(1, 1.75 / aspect) ** 0.85;
    const k = 1 - Math.pow(0.05, dt);
    camera.position.x += (pointer.x * 0.9 - camera.position.x) * k;
    camera.position.y += (5.4 - pointer.y * 0.5 - camera.position.y) * k;
    camera.position.z = 12.5 * back;
    camera.lookAt(0, 1.3, 0);
  });

  return (
    <>
      <StudioEnvironment />

      {/* Shadow catcher — the floor itself is invisible */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9, 0]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <shadowMaterial opacity={0.55} />
      </mesh>

      {/* Belt */}
      <mesh geometry={belt} material={beltMat} position={[0, -0.21, 0]} castShadow receiveShadow />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} receiveShadow>
        <planeGeometry args={[BELT_LEN, 2.3]} />
        <meshStandardMaterial map={textures.belt} roughness={0.9} envMapIntensity={0.25} />
      </mesh>
      {[-1.24, 1.24].map((z) => (
        <mesh key={z} material={runnerMat} position={[0, 0.01, z]}>
          <boxGeometry args={[BELT_LEN, 0.05, 0.07]} />
        </mesh>
      ))}

      <Press active={active} />

      <group ref={crates}>
        {factoryModules.map((m, i) => (
          <Crate key={m.id} module={m} index={i} active={i === active} onSelect={onSelect} />
        ))}
      </group>
    </>
  );
}

export function FactoryScene({ active, onSelect, className }: { active: number; onSelect: (i: number) => void; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "150px" });
    io.observe(el);
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.body.style.cursor = "";
    };
  }, []);

  return (
    <div ref={wrap} className={cn("transition-opacity duration-700", ready ? "opacity-100" : "opacity-0", className)} aria-hidden="true">
      <Canvas
        shadows
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 5.4, 12.5], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={() => setReady(true)}
      >
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[4, 9, 6]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={8}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0004}
          shadow-radius={6}
        />
        <directionalLight position={[-6, 4, -4]} intensity={1.2} color={blue[300]} />
        <Factory active={active} onSelect={onSelect} />
        <Precompile />
      </Canvas>
    </div>
  );
}
