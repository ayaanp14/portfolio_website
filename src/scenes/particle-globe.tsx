"use client";

import { type MutableRefObject, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import { SceneCanvas } from "@/scenes/scene-canvas";
import { detectQuality, qualityPreset } from "@/lib/quality";

const SIGNAL = new THREE.Color("#00ff88");
const CYAN = new THREE.Color("#00e5ff");

/* ------------------------------------------------------------------ */
/* Shaders                                                             */
/* ------------------------------------------------------------------ */

const pointsVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uMouse;
  uniform float uMouseActive;
  uniform vec3 uShockOrigin;
  uniform float uShockTime;
  uniform float uIntro;
  varying float vGlow;
  varying float vSeed;

  void main() {
    vec3 p = position;
    vec3 n = normalize(position);

    // breathing procedural drift
    float wobble = sin(uTime * 0.55 + aSeed * 12.56) * 0.5
                 + sin(uTime * 1.1 + aSeed * 41.0) * 0.5;
    p += n * wobble * 0.035;

    // cursor influence: brighten + gentle repel
    float md = distance(p, uMouse);
    float influence = smoothstep(0.65, 0.0, md) * uMouseActive;
    p += normalize(p - uMouse + 0.0001) * influence * 0.12;

    // click shockwave travelling across the surface
    float sd = distance(p, uShockOrigin);
    float wave = smoothstep(0.3, 0.0, abs(sd - uShockTime * 2.2)) * exp(-uShockTime * 1.4);
    p += n * wave * 0.3;

    // boot intro: assemble from a scattered cloud
    p = mix(n * (2.4 + aSeed * 2.0), p, uIntro);

    vGlow = influence + wave;
    vSeed = aSeed;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float twinkle = 0.78 + 0.22 * sin(uTime * (1.5 + aSeed) + aSeed * 90.0);
    gl_PointSize = (2.6 + aSeed * 3.2 + vGlow * 5.0) * twinkle * uPixelRatio * (6.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const pointsFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uIntro;
  varying float vGlow;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float disc = smoothstep(0.5, 0.05, d);
    vec3 color = mix(uColorA, uColorB, step(0.82, fract(vSeed * 7.31))) * 1.25;
    color += vGlow * 0.9;
    float alpha = disc * (0.5 + vSeed * 0.5 + vGlow) * uIntro;
    gl_FragColor = vec4(color, alpha);
  }
`;

const linesVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform vec3 uMouse;
  uniform float uMouseActive;
  varying float vAlpha;

  void main() {
    float pulse = 0.5 + 0.5 * sin(uTime * (0.6 + aSeed * 1.2) + aSeed * 40.0);
    float md = distance(position, uMouse);
    float near = smoothstep(0.8, 0.0, md) * uMouseActive;
    vAlpha = pulse * 0.3 + near * 0.6;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const linesFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntro;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uColor, vAlpha * uIntro);
  }
`;

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntro;
  varying vec3 vNormal;
  void main() {
    // rim-only fresnel: transparent at the center, glowing at the silhouette
    float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.5);
    gl_FragColor = vec4(uColor, rim * 0.55 * uIntro);
  }
`;

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

function fibonacciSphere(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
    seeds[i] = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  }

  return { positions, seeds };
}

/** Connect nearby surface points into a static network topology. */
function buildConnections(positions: Float32Array, count: number, maxLinks: number) {
  const verts: number[] = [];
  const seeds: number[] = [];
  const threshold = 0.42;
  let links = 0;

  for (let i = 0; i < count && links < maxLinks; i += 3) {
    for (let j = i + 1; j < count && links < maxLinks; j += 7) {
      const dx = positions[i * 3] - positions[j * 3];
      const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
      const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < threshold * threshold) {
        const seed = Math.abs(Math.sin((i + j) * 7.13)) % 1;
        verts.push(
          positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
          positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2],
        );
        seeds.push(seed, seed);
        links++;
      }
    }
  }

  return { verts: new Float32Array(verts), seeds: new Float32Array(seeds) };
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

const PACKET_COUNT = 7;
const GLOBE_RADIUS = 1.55;

type GlobeSceneProps = {
  scrollRef: MutableRefObject<number>;
  bootedRef: MutableRefObject<boolean>;
};

function GlobeScene({ scrollRef, bootedRef }: GlobeSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const hitRef = useRef<THREE.Mesh>(null);
  const packetsRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const gl = useThree((s) => s.gl);

  const preset = useMemo(() => qualityPreset[detectQuality()], []);

  const surface = useMemo(
    () => fibonacciSphere(preset.globeParticles, GLOBE_RADIUS),
    [preset],
  );
  const halo = useMemo(() => {
    const { positions, seeds } = fibonacciSphere(preset.haloParticles, GLOBE_RADIUS);
    // scatter the halo outward into loose orbital shells
    for (let i = 0; i < preset.haloParticles; i++) {
      const scale = 1.25 + (seeds[i] % 1) * 1.3;
      positions[i * 3] *= scale;
      positions[i * 3 + 1] *= scale * 0.7;
      positions[i * 3 + 2] *= scale;
    }
    return { positions, seeds };
  }, [preset]);
  const connections = useMemo(
    () => buildConnections(surface.positions, preset.globeParticles, preset.connections),
    [surface, preset],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector3(99, 99, 99) },
      uMouseActive: { value: 0 },
      uShockOrigin: { value: new THREE.Vector3(0, GLOBE_RADIUS, 0) },
      uShockTime: { value: 30 },
      uIntro: { value: 0 },
      uColorA: { value: SIGNAL },
      uColorB: { value: CYAN },
      uColor: { value: SIGNAL },
    }),
    [],
  );

  const packetState = useMemo(
    () =>
      Array.from({ length: PACKET_COUNT }, (_, i) => ({
        from: new THREE.Vector3(),
        to: new THREE.Vector3(),
        t: (i / PACKET_COUNT) * 1.2,
        speed: 0.25 + Math.abs(Math.sin(i * 3.7)) * 0.3,
      })),
    [],
  );

  const pickSurfacePoint = (target: THREE.Vector3) => {
    const i = Math.floor(Math.random() * preset.globeParticles);
    target.set(
      surface.positions[i * 3],
      surface.positions[i * 3 + 1],
      surface.positions[i * 3 + 2],
    );
  };

  const smoothRotation = useRef({ x: 0, y: 0 });
  const shockClock = useRef(30);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Window-level pointer tracking in canvas NDC space, so the globe keeps
  // reacting even when the cursor is over overlaid content (headline, CTAs,
  // system panels) that swallows the canvas's own pointer events.
  const ndcPointer = useRef(new THREE.Vector2(0, 0));
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      ndcPointer.current.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  // Materials are built imperatively around the ONE shared uniforms object,
  // so per-frame `.value` mutations reach the GPU (the declarative uniforms
  // prop snapshots the object and silently ignores later mutations).
  const materials = useMemo(() => {
    const common = {
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    };
    return {
      points: new THREE.ShaderMaterial({
        ...common,
        vertexShader: pointsVertex,
        fragmentShader: pointsFragment,
      }),
      lines: new THREE.ShaderMaterial({
        ...common,
        vertexShader: linesVertex,
        fragmentShader: linesFragment,
      }),
      atmosphere: new THREE.ShaderMaterial({
        ...common,
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
      }),
    };
  }, [uniforms]);

  useEffect(() => {
    return () => {
      materials.points.dispose();
      materials.lines.dispose();
      materials.atmosphere.dispose();
    };
  }, [materials]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;
    uniforms.uPixelRatio.value = gl.getPixelRatio();

    // boot intro assembly
    const introTarget = bootedRef.current ? 1 : 0;
    uniforms.uIntro.value = THREE.MathUtils.damp(uniforms.uIntro.value, introTarget, 1.6, delta);

    // shock timer
    shockClock.current += delta;
    uniforms.uShockTime.value = shockClock.current;

    const group = groupRef.current;
    if (!group) return;

    // slow idle spin + eased pointer parallax
    const px = ndcPointer.current.x;
    const py = ndcPointer.current.y;
    smoothRotation.current.x = THREE.MathUtils.damp(smoothRotation.current.x, -py * 0.22, 2.5, delta);
    smoothRotation.current.y += delta * 0.08;
    group.rotation.x = smoothRotation.current.x + 0.18;
    group.rotation.y = smoothRotation.current.y + px * 0.25;

    // scroll: globe recedes and dims as the hero leaves
    const scroll = scrollRef.current;
    group.position.z = -scroll * 2.2;
    group.position.y = scroll * 1.4;

    // cursor raycast onto the sphere (in local space of the rotating group)
    state.raycaster.setFromCamera(ndcPointer.current, state.camera);
    const hit = hitRef.current ? state.raycaster.intersectObject(hitRef.current, false) : [];
    if (hit.length > 0) {
      group.worldToLocal(tmp.copy(hit[0].point));
      uniforms.uMouse.value.copy(tmp);
      uniforms.uMouseActive.value = THREE.MathUtils.damp(uniforms.uMouseActive.value, 1, 4, delta);
    } else {
      uniforms.uMouseActive.value = THREE.MathUtils.damp(uniforms.uMouseActive.value, 0, 4, delta);
    }

    // data packets travelling between surface nodes
    const packets = packetsRef.current;
    if (packets) {
      const attr = packets.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < PACKET_COUNT; i++) {
        const p = packetState[i];
        if (p.t >= 1 || p.from.lengthSq() === 0) {
          pickSurfacePoint(p.from);
          pickSurfacePoint(p.to);
          p.t = 0;
        }
        p.t += delta * p.speed;
        const k = Math.min(p.t, 1);
        // arc: slerp between nodes, lifted above the surface mid-flight
        tmp.copy(p.from).lerp(p.to, k).normalize();
        const lift = GLOBE_RADIUS * (1 + Math.sin(k * Math.PI) * 0.22);
        attr.setXYZ(i, tmp.x * lift, tmp.y * lift, tmp.z * lift);
      }
      attr.needsUpdate = true;
    }

    // click shockwave ring
    const ring = ringRef.current;
    if (ring) {
      const s = shockClock.current;
      const life = Math.max(0, 1 - s / 1.4);
      ring.visible = life > 0;
      if (ring.visible) {
        const scale = 0.2 + s * 2.6;
        ring.scale.setScalar(scale);
        (ring.material as THREE.MeshBasicMaterial).opacity = life * 0.6;
      }
    }
  });

  const onGlobeClick = (event: { point: THREE.Vector3 }) => {
    const group = groupRef.current;
    if (!group) return;
    group.worldToLocal(tmp.copy(event.point));
    uniforms.uShockOrigin.value.copy(tmp);
    shockClock.current = 0;

    const ring = ringRef.current;
    if (ring) {
      ring.position.copy(tmp).multiplyScalar(1.02);
      ring.lookAt(tmp.clone().multiplyScalar(2));
    }
  };

  return (
    <group ref={groupRef}>
      {/* invisible hit target for raycasting + clicks */}
      <mesh ref={hitRef} onPointerDown={onGlobeClick} visible={false}>
        <sphereGeometry args={[GLOBE_RADIUS * 1.05, 16, 16]} />
        <meshBasicMaterial />
      </mesh>

      {/* surface particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[surface.positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[surface.seeds, 1]} />
        </bufferGeometry>
        <primitive object={materials.points} attach="material" />
      </points>

      {/* loose orbital halo */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[halo.positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[halo.seeds, 1]} />
        </bufferGeometry>
        <primitive object={materials.points} attach="material" />
      </points>

      {/* dynamic node connections */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[connections.verts, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[connections.seeds, 1]} />
        </bufferGeometry>
        <primitive object={materials.lines} attach="material" />
      </lineSegments>

      {/* wireframe lat/long shell */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.995, 24, 16]} />
        <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.03} />
      </mesh>

      {/* atmosphere rim */}
      <mesh scale={1.18}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <primitive object={materials.atmosphere} attach="material" />
      </mesh>

      {/* orbital rings */}
      {[0.4, -0.5, 1.1].map((tilt, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + tilt, i * 0.7, 0]}>
          <torusGeometry args={[GLOBE_RADIUS * (1.35 + i * 0.22), 0.0022, 6, 128]} />
          <meshBasicMaterial
            color={i === 1 ? "#00e5ff" : "#00ff88"}
            transparent
            opacity={0.18}
          />
        </mesh>
      ))}

      {/* data packets */}
      <points ref={packetsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(PACKET_COUNT * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.055}
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* click shockwave ring */}
      <mesh ref={ringRef} visible={false}>
        <ringGeometry args={[0.46, 0.5, 48]} />
        <meshBasicMaterial
          color="#00ff88"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

type ParticleGlobeProps = {
  className?: string;
  scrollRef: MutableRefObject<number>;
  bootedRef: MutableRefObject<boolean>;
};

export function ParticleGlobe({ className, scrollRef, bootedRef }: ParticleGlobeProps) {
  return (
    <SceneCanvas className={className} camera={{ position: [0, 0, 5.7], fov: 42 }}>
      <GlobeScene scrollRef={scrollRef} bootedRef={bootedRef} />
    </SceneCanvas>
  );
}
