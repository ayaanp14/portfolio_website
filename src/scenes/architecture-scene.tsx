"use client";

import { type MutableRefObject, type ReactNode, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Html, Lightformer, MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { IconType } from "react-icons";
import {
  SiExpress,
  SiGithubactions,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiSocketdotio,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";
import { FiZap } from "react-icons/fi";

import { SceneCanvas } from "@/scenes/scene-canvas";
import { architectureLayers } from "@/data/architecture";
import { detectQuality, qualityPreset, type ArchQuality } from "@/lib/quality";

const NODE_SPACING = 2.35;
const PANEL_W = 1.85;
const PANEL_H = 1.85;
const PANEL_D = 0.22;
const PANEL_Y = -0.1;
const FLOOR_Y = -1.3;
const GAPS = architectureLayers.length - 1;

/** Brand logos rendered inside each glass panel. */
const layerIcons: Record<string, { Icon: IconType; color: string }[]> = {
  frontend: [
    { Icon: SiReact, color: "#61dafb" },
    { Icon: SiNextdotjs, color: "#e8f0ee" },
  ],
  backend: [
    { Icon: SiNodedotjs, color: "#5fa04e" },
    { Icon: SiExpress, color: "#d7e0dd" },
  ],
  realtime: [
    { Icon: SiSocketdotio, color: "#e8f0ee" },
    { Icon: FiZap, color: "#ffd166" },
  ],
  data: [
    { Icon: SiMongodb, color: "#47a248" },
    { Icon: SiPostgresql, color: "#699eca" },
    { Icon: SiMysql, color: "#de8a03" },
  ],
  infra: [
    { Icon: VscAzure, color: "#2fa8e0" },
    { Icon: SiGithubactions, color: "#2088ff" },
  ],
};

type ArchSceneProps = {
  progressRef: MutableRefObject<number>;
};

/**
 * Shared per-frame layout state: narrow viewports switch the scene into a
 * "pan" mode where the camera travels along the panel row instead of
 * shrinking the whole row into view.
 */
type Rig = { mobile: boolean; scale: number };

/* ------------------------------------------------------------------ */
/* Geometry + shader helpers                                           */
/* ------------------------------------------------------------------ */

/** Outline of a rounded rectangle in the XY plane, centered at origin. */
function roundedRectPoints(w: number, h: number, r: number, segments = 8): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const hw = w / 2 - r;
  const hh = h / 2 - r;
  const corners = [
    { cx: hw, cy: hh, start: 0 },
    { cx: -hw, cy: hh, start: Math.PI / 2 },
    { cx: -hw, cy: -hh, start: Math.PI },
    { cx: hw, cy: -hh, start: (3 * Math.PI) / 2 },
  ];
  for (const c of corners) {
    for (let i = 0; i <= segments; i++) {
      const a = c.start + (i / segments) * (Math.PI / 2);
      pts.push(new THREE.Vector3(c.cx + Math.cos(a) * r, c.cy + Math.sin(a) * r, 0));
    }
  }
  return pts;
}

const softPointVertex = /* glsl */ `
  uniform float uScale;
  uniform float uSize;
  varying vec3 vColor;
  void main() {
    #ifdef USE_COLOR
      vColor = color;
    #else
      vColor = vec3(1.0);
    #endif
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (uScale / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const softPointFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.06, d);
    gl_FragColor = vec4(vColor * uColor, alpha * uOpacity);
  }
`;

/** Round, soft-edged glow particles — replaces PointsMaterial's hard squares. */
function makeSoftPointsMaterial(size: number, color: string, opacity: number, vertexColors: boolean) {
  return new THREE.ShaderMaterial({
    vertexShader: softPointVertex,
    fragmentShader: softPointFragment,
    uniforms: {
      uSize: { value: size },
      uScale: { value: 600 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors,
  });
}

/** Per-frame scale so soft points keep PointsMaterial-like size attenuation. */
function pointScale(state: { size: { height: number }; viewport: { dpr: number } }) {
  return state.size.height * state.viewport.dpr;
}

const rimVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const rimFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 3.0);
    gl_FragColor = vec4(uColor, rim * 0.55);
  }
`;

/** Rounded-rect line frame — the bright bezel that sells the glass slab. */
function OutlineLoop({
  w,
  h,
  r,
  color,
  opacity,
  position,
  rotation,
}: {
  w: number;
  h: number;
  r: number;
  color: string;
  opacity: number;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const geometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(roundedRectPoints(w, h, r)),
    [w, h, r],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineLoop geometry={geometry} position={position} rotation={rotation ?? [0, 0, 0]}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        toneMapped={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineLoop>
  );
}

/* ------------------------------------------------------------------ */
/* Glass display panel                                                 */
/* ------------------------------------------------------------------ */

type NodeProps = {
  index: number;
  layerId: string;
  title: string;
  tech: string;
  progressRef: MutableRefObject<number>;
  arch: ArchQuality;
  rig: MutableRefObject<Rig>;
};

/**
 * One stack layer: a physically-shaded glass slab with a glowing bezel,
 * standing on a layered metal pedestal, rising out of the floor as its
 * slice of the scroll progresses. Text and brand logos live in a
 * perspective-transformed HTML card etched onto the glass front face.
 */
function ArchNode({ index, layerId, title, tech, progressRef, arch, rig }: NodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ledRef = useRef<THREE.MeshBasicMaterial>(null);
  const targetX = (index - 2) * NODE_SPACING;
  const centerTilt = -(index - 2) * 0.07;

  const moteMaterial = useMemo(() => makeSoftPointsMaterial(0.03, "#00e5ff", 0.55, false), []);
  useEffect(() => () => moteMaterial.dispose(), [moteMaterial]);

  const rimMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: rimVertex,
        fragmentShader: rimFragment,
        uniforms: { uColor: { value: new THREE.Color("#17e2b0") } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  useEffect(() => () => rimMaterial.dispose(), [rimMaterial]);

  const innerParticles = useMemo(() => {
    const arr = new Float32Array(18 * 3);
    for (let i = 0; i < 18; i++) {
      const h1 = Math.sin((i + 1) * 127.1 + index * 311.7) * 43758.5453;
      const h2 = Math.sin((i + 7) * 269.5 + index * 183.3) * 43758.5453;
      const h3 = Math.sin((i + 13) * 419.2 + index * 371.9) * 43758.5453;
      arr[i * 3] = ((h1 - Math.floor(h1)) - 0.5) * 1.5;
      arr[i * 3 + 1] = ((h2 - Math.floor(h2)) - 0.5) * 1.5;
      arr[i * 3 + 2] = ((h3 - Math.floor(h3)) - 0.5) * 0.08;
    }
    return arr;
  }, [index]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const t = state.clock.elapsedTime;
    const p = progressRef.current;
    // panels assemble earlier in pan mode so each is built before the
    // camera reaches it
    const activateAt = rig.current.mobile ? 0.02 + index * 0.09 : 0.05 + index * 0.11;
    const local = THREE.MathUtils.clamp((p - activateAt) / 0.16, 0, 1);
    const eased = 1 - Math.pow(1 - local, 3);

    // slide apart from center while rising out of the floor
    group.position.x = THREE.MathUtils.damp(group.position.x, targetX * eased, 5, delta);
    const bob = Math.sin(t * 0.9 + index * 1.7) * 0.04 * eased;
    group.position.y = THREE.MathUtils.damp(group.position.y, (1 - eased) * -2.4 + bob, 5, delta);
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      (1 - eased) * 0.6 + centerTilt + Math.sin(t * 0.35 + index) * 0.03,
      4,
      delta,
    );
    group.scale.setScalar(0.55 + eased * 0.45);

    if (cardRef.current) {
      cardRef.current.style.opacity = String(THREE.MathUtils.clamp((eased - 0.5) / 0.5, 0, 1));
    }
    if (ledRef.current) {
      ledRef.current.opacity = eased * (0.75 + Math.sin(t * 2.4 + index * 2.2) * 0.25);
    }
    moteMaterial.uniforms.uScale.value = pointScale(state);
  });

  const icons = layerIcons[layerId] ?? [];

  return (
    <group ref={groupRef} position={[0, -2.4, 0]}>
      {/* glass slab */}
      <RoundedBox args={[PANEL_W, PANEL_H, PANEL_D]} radius={0.07} smoothness={5} position={[0, PANEL_Y, 0]}>
        <meshPhysicalMaterial
          color="#0d3a30"
          emissive="#052e26"
          emissiveIntensity={0.35}
          transmission={arch.transmission ? 0.94 : 0}
          thickness={0.4}
          ior={1.48}
          roughness={0.1}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.15}
          envMapIntensity={2.2}
          attenuationColor="#14685a"
          attenuationDistance={1.8}
          transparent={!arch.transmission}
          opacity={arch.transmission ? 1 : 0.35}
        />
      </RoundedBox>

      {/* fresnel rim — soft teal glow hugging the slab silhouette */}
      <RoundedBox
        args={[PANEL_W, PANEL_H, PANEL_D]}
        radius={0.07}
        smoothness={5}
        position={[0, PANEL_Y, 0]}
        scale={1.02}
      >
        <primitive object={rimMaterial} attach="material" />
      </RoundedBox>

      {/* bright bezel frames on the front and back faces */}
      <OutlineLoop
        w={PANEL_W + 0.01}
        h={PANEL_H + 0.01}
        r={0.09}
        color="#3dffc2"
        opacity={0.85}
        position={[0, PANEL_Y, PANEL_D / 2 + 0.004]}
      />
      <OutlineLoop
        w={PANEL_W + 0.01}
        h={PANEL_H + 0.01}
        r={0.09}
        color="#3dffc2"
        opacity={0.3}
        position={[0, PANEL_Y, -(PANEL_D / 2 + 0.004)]}
      />

      {/* faint data motes suspended in the glass */}
      <points position={[0, PANEL_Y, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[innerParticles, 3]} />
        </bufferGeometry>
        <primitive object={moteMaterial} attach="material" />
      </points>

      {/* pedestal: neck + two stacked brushed plates with glowing rims */}
      <mesh position={[0, -1.085, 0]}>
        <boxGeometry args={[0.6, 0.12, 0.4]} />
        <meshStandardMaterial color="#0b1514" metalness={0.85} roughness={0.35} envMapIntensity={0.9} />
      </mesh>
      <RoundedBox args={[1.1, 0.09, 0.7]} radius={0.03} smoothness={4} position={[0, -1.19, 0]}>
        <meshStandardMaterial color="#0c1517" metalness={0.9} roughness={0.3} envMapIntensity={0.8} />
      </RoundedBox>
      <RoundedBox args={[1.5, 0.07, 0.95]} radius={0.03} smoothness={4} position={[0, -1.263, 0]}>
        <meshStandardMaterial color="#0a1214" metalness={0.9} roughness={0.32} envMapIntensity={0.8} />
      </RoundedBox>
      <OutlineLoop
        w={1.12}
        h={0.72}
        r={0.05}
        color="#2fffb0"
        opacity={0.5}
        position={[0, -1.144, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <OutlineLoop
        w={1.52}
        h={0.97}
        r={0.05}
        color="#2fffb0"
        opacity={0.35}
        position={[0, -1.227, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* status LED strip on the pedestal front */}
      <mesh position={[0, -1.19, 0.355]}>
        <boxGeometry args={[0.3, 0.02, 0.01]} />
        <meshBasicMaterial
          ref={ledRef}
          color="#00ff9d"
          transparent
          opacity={0}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* floor glow rings under the pedestal */}
      {[
        [0.62, 0.66, 0.18],
        [0.78, 0.8, 0.08],
      ].map(([inner, outer, opacity], i) => (
        <mesh key={i} position={[0, FLOOR_Y + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[inner, outer, 48]} />
          <meshBasicMaterial
            color="#00ff88"
            transparent
            opacity={opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* HUD card etched onto the glass front face */}
      <Html
        transform
        distanceFactor={1.6}
        position={[0, PANEL_Y + 0.02, PANEL_D / 2 + 0.012]}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div
          ref={cardRef}
          className="pointer-events-none flex select-none flex-col items-center justify-center gap-5 text-center"
          style={{
            width: 400,
            height: 400,
            opacity: 0,
            borderRadius: 26,
            border: "1px solid rgba(150,255,220,0.3)",
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.09) 12%, rgba(255,255,255,0.02) 28%, rgba(255,255,255,0) 42%), linear-gradient(165deg, rgba(120,230,255,0.10), rgba(10,60,50,0.05) 55%, rgba(0,0,0,0))",
            boxShadow:
              "inset 0 0 44px rgba(0,255,170,0.06), inset 0 1px 0 rgba(255,255,255,0.14)",
          }}
        >
          <p className="sys-heading text-[30px] font-semibold tracking-[0.14em] text-[#f2fffa]">
            {title}
          </p>
          <p className="-mt-3 font-mono text-[19px] tracking-[0.06em] text-[#a8e2cc]">{tech}</p>
          <div className="mt-3 flex items-center justify-center gap-8">
            {icons.map(({ Icon, color }, i) => (
              <Icon key={i} size={58} color={color} style={{ filter: `drop-shadow(0 0 10px ${color}66)` }} />
            ))}
          </div>
        </div>
      </Html>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Particle data streams                                               */
/* ------------------------------------------------------------------ */

type StreamSpec = {
  samples: THREE.Vector3[];
  count: number;
  speedMin: number;
  speedMax: number;
};

/** Braided streams flowing between adjacent panels at panel height. */
function buildGapStreams(braids: number, gapParticles: number): StreamSpec[] {
  const specs: StreamSpec[] = [];
  for (let g = 0; g < GAPS; g++) {
    const xa = (g - 2) * NODE_SPACING + PANEL_W / 2 - 0.15;
    const xb = (g - 1) * NODE_SPACING - PANEL_W / 2 + 0.15;
    for (let b = 0; b < braids; b++) {
      const phase = g * 2.1 + b * 1.7;
      const yBase = PANEL_Y + 0.05 + (b - (braids - 1) / 2) * 0.16;
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        pts.push(
          new THREE.Vector3(
            THREE.MathUtils.lerp(xa, xb, t),
            yBase + Math.sin(t * Math.PI * 2 + phase) * 0.09,
            0.05 + Math.sin(t * Math.PI + phase * 1.3) * 0.1,
          ),
        );
      }
      specs.push({
        samples: new THREE.CatmullRomCurve3(pts).getPoints(32),
        count: gapParticles,
        speedMin: 0.25,
        speedMax: 0.55,
      });
    }
  }
  return specs;
}

/** Long undulating streams sweeping across the floor in front of the row. */
function buildFloorStreams(streams: number, floorParticles: number): StreamSpec[] {
  const specs: StreamSpec[] = [];
  for (let f = 0; f < streams; f++) {
    const z0 = 1.9 + f * 0.45;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) {
      const x = THREE.MathUtils.lerp(-7, 7, i / 10);
      pts.push(new THREE.Vector3(x, FLOOR_Y + 0.03, z0 + Math.sin(x * 1.1 + f * 2.4) * 0.28));
    }
    specs.push({
      samples: new THREE.CatmullRomCurve3(pts).getPoints(64),
      count: floorParticles,
      speedMin: 0.05,
      speedMax: 0.12,
    });
  }
  return specs;
}

const STREAM_PALETTE = ["#7dffd8", "#59d8ff", "#2fffa8", "#8ffff0", "#59d8ff", "#7dffd8", "#2fffa8", "#ffffff"];

type StreamFieldProps = {
  specs: StreamSpec[];
  progressRef: MutableRefObject<number>;
  lineColor: string;
  lineOpacity: number;
  particleSize: number;
};

/**
 * Renders a set of stream curves as faint guide lines + flowing particles.
 * Particles draw twice — a bright core pass and a wide soft halo pass — so
 * each dot reads as a glowing packet instead of a hard pixel.
 */
function StreamField({ specs, progressRef, lineColor, lineOpacity, particleSize }: StreamFieldProps) {
  const coreMaterial = useMemo(() => makeSoftPointsMaterial(particleSize, "#ffffff", 0, true), [particleSize]);
  const haloMaterial = useMemo(() => makeSoftPointsMaterial(particleSize * 2.6, "#19ffc4", 0, false), [particleSize]);

  const { lines, lineMaterial, particles, geometry } = useMemo(() => {
    const lineMaterial = new THREE.LineBasicMaterial({
      color: lineColor,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lines = specs.map(
      (spec) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(spec.samples), lineMaterial),
    );

    const hash = (n: number) => {
      const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    const particles: { spec: StreamSpec; t: number; speed: number }[] = [];
    specs.forEach((spec, si) => {
      for (let i = 0; i < spec.count; i++) {
        const seed = si * 131 + i;
        particles.push({
          spec,
          t: hash(seed),
          speed: THREE.MathUtils.lerp(spec.speedMin, spec.speedMax, hash(seed + 61)),
        });
      }
    });

    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 3);
    const c = new THREE.Color();
    for (let i = 0; i < particles.length; i++) {
      c.set(STREAM_PALETTE[i % STREAM_PALETTE.length]);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return { lines, lineMaterial, particles, geometry };
  }, [specs, lineColor]);

  useEffect(() => {
    return () => {
      lines.forEach((line) => line.geometry.dispose());
      lineMaterial.dispose();
      geometry.dispose();
      coreMaterial.dispose();
      haloMaterial.dispose();
    };
  }, [lines, lineMaterial, geometry, coreMaterial, haloMaterial]);

  useFrame((state, delta) => {
    const p = progressRef.current;
    const reach = THREE.MathUtils.clamp((p - 0.15) / 0.5, 0, 1);
    lineMaterial.opacity = reach * lineOpacity;
    const scale = pointScale(state);
    coreMaterial.uniforms.uScale.value = scale;
    haloMaterial.uniforms.uScale.value = scale;
    coreMaterial.uniforms.uOpacity.value = reach;
    haloMaterial.uniforms.uOpacity.value = reach * 0.3;

    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < particles.length; i++) {
      const part = particles[i];
      part.t = (part.t + delta * part.speed * (0.35 + 0.65 * reach)) % 1;
      const s = part.spec.samples;
      const f = part.t * (s.length - 1);
      const idx = Math.min(Math.floor(f), s.length - 2);
      const frac = f - idx;
      attr.setXYZ(
        i,
        THREE.MathUtils.lerp(s[idx].x, s[idx + 1].x, frac),
        THREE.MathUtils.lerp(s[idx].y, s[idx + 1].y, frac),
        THREE.MathUtils.lerp(s[idx].z, s[idx + 1].z, frac),
      );
    }
    attr.needsUpdate = true;
  });

  return (
    <group>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
      <points geometry={geometry}>
        <primitive object={coreMaterial} attach="material" />
      </points>
      <points geometry={geometry}>
        <primitive object={haloMaterial} attach="material" />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Floor, camera, layout                                               */
/* ------------------------------------------------------------------ */

/** Soft teal light pool under the panel row. */
function FloorGlow() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#0fdfb0") } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float d = length((vUv - 0.5) * 2.0);
            float a = smoothstep(1.0, 0.0, d);
            gl_FragColor = vec4(uColor, a * 0.13);
          }
        `,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh position={[0, FLOOR_Y + 0.02, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[15, 7]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Floor({ reflections }: { reflections: boolean }) {
  return (
    <>
      <mesh position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[42, 26]} />
        {reflections ? (
          <MeshReflectorMaterial
            resolution={512}
            blur={[300, 80]}
            mixBlur={0.9}
            mixStrength={1.4}
            mirror={0.45}
            depthScale={0.6}
            minDepthThreshold={0.5}
            maxDepthThreshold={1.4}
            roughness={0.7}
            metalness={0.4}
            color="#04090b"
          />
        ) : (
          <meshStandardMaterial color="#04090b" metalness={0.6} roughness={0.35} envMapIntensity={0.5} />
        )}
      </mesh>
      <gridHelper args={[30, 30, "#0f2a1e", "#0a1a14"]} position={[0, FLOOR_Y + 0.012, 0]} />
      <FloorGlow />
    </>
  );
}

const ORIGIN = new THREE.Vector3(0, 0, 0);

/**
 * Sizes the panel row for the viewport. Wide screens shrink the row to fit;
 * narrow screens keep panels near full size (the camera pans instead) and
 * the row is re-anchored so pedestals stay in contact with the floor.
 */
function ResponsiveGroup({ children, rig }: { children: ReactNode; rig: MutableRefObject<Rig> }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const view = state.viewport.getCurrentViewport(state.camera, ORIGIN);
    const mobile = view.width < 7.2;
    const scale = mobile
      ? THREE.MathUtils.clamp(view.width / 4.6, 0.55, 0.95)
      : THREE.MathUtils.clamp(view.width / 12.6, 0.42, 1.06);
    rig.current.mobile = mobile;
    rig.current.scale = scale;
    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.y = FLOOR_Y * (1 - scale);
  });

  return <group ref={groupRef}>{children}</group>;
}

function CameraRig({ progressRef, rig }: ArchSceneProps & { rig: MutableRefObject<Rig> }) {
  useFrame((state, delta) => {
    const p = progressRef.current;
    const cam = state.camera;

    if (rig.current.mobile) {
      // travel along the row: each panel passes through center frame
      const span = 2 * NODE_SPACING * rig.current.scale;
      const t = THREE.MathUtils.clamp((p - 0.1) / 0.8, 0, 1);
      const targetX = THREE.MathUtils.lerp(-span, span, t) + state.pointer.x * 0.15;
      cam.position.x = THREE.MathUtils.damp(cam.position.x, targetX, 3, delta);
      cam.position.z = THREE.MathUtils.damp(cam.position.z, 7.2 - p * 0.5, 3, delta);
      cam.position.y = THREE.MathUtils.damp(cam.position.y, 1.0 - p * 0.25, 3, delta);
      cam.lookAt(cam.position.x, -0.45, 0);
      return;
    }

    cam.position.z = THREE.MathUtils.damp(cam.position.z, 8.5 - p * 1.3, 3, delta);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, 1.55 - p * 0.65, 3, delta);
    cam.position.x = THREE.MathUtils.damp(cam.position.x, state.pointer.x * 0.35, 2, delta);
    cam.lookAt(0, -0.1, 0);
  });
  return null;
}

function ArchScene({ progressRef }: ArchSceneProps) {
  const preset = useMemo(() => qualityPreset[detectQuality()], []);
  const arch = preset.arch;
  const rig = useRef<Rig>({ mobile: false, scale: 1 });

  const gapStreams = useMemo(() => buildGapStreams(arch.braids, arch.gapParticles), [arch]);
  const floorStreams = useMemo(() => buildFloorStreams(arch.floorStreams, arch.floorParticles), [arch]);

  return (
    <>
      <fog attach="fog" args={["#030a08", 12, 26]} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 7, 6]} intensity={1.8} color="#d8fff0" />
      <pointLight position={[-6, 3, 3]} intensity={5} color="#00e5ff" />
      <pointLight position={[6, 2.5, 4]} intensity={6} color="#00ff88" />
      <pointLight position={[0, 3.5, -3]} intensity={3} color="#0a84ff" />

      {/* local studio environment so glass and metal have something to reflect */}
      <Environment frames={1} resolution={128}>
        <Lightformer intensity={3.5} position={[0, 4, 3]} scale={[9, 1.2, 1]} color="#9fffe0" />
        <Lightformer intensity={1.2} position={[0, 1, 6]} scale={[10, 2, 1]} color="#cfffef" />
        <Lightformer intensity={1.3} position={[-4, 2, -2]} rotation-y={Math.PI / 3} scale={[3, 1, 1]} color="#7fdfff" />
        <Lightformer intensity={1.3} position={[4, 2, -2]} rotation-y={-Math.PI / 3} scale={[3, 1, 1]} color="#8fffd0" />
        <Lightformer intensity={0.6} position={[0, -3, 2]} scale={[7, 2, 1]} color="#0e5c4a" />
      </Environment>

      <CameraRig progressRef={progressRef} rig={rig} />

      <ResponsiveGroup rig={rig}>
        {architectureLayers.map((layer, i) => (
          <ArchNode
            key={layer.id}
            index={i}
            layerId={layer.id}
            title={layer.title}
            tech={layer.tech}
            progressRef={progressRef}
            arch={arch}
            rig={rig}
          />
        ))}

        <StreamField
          specs={gapStreams}
          progressRef={progressRef}
          lineColor="#17e6b8"
          lineOpacity={0.35}
          particleSize={0.06}
        />
      </ResponsiveGroup>

      <StreamField
        specs={floorStreams}
        progressRef={progressRef}
        lineColor="#0fd0b0"
        lineOpacity={0.2}
        particleSize={0.07}
      />

      <Floor reflections={arch.reflections} />
    </>
  );
}

type ArchitectureSceneProps = {
  className?: string;
  progressRef: MutableRefObject<number>;
};

export function ArchitectureScene({ className, progressRef }: ArchitectureSceneProps) {
  return (
    <SceneCanvas className={className} camera={{ position: [0, 1.55, 8.5], fov: 45 }}>
      <ArchScene progressRef={progressRef} />
    </SceneCanvas>
  );
}
