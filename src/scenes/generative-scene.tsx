"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { SceneCanvas } from "@/scenes/scene-canvas";
import { simplex3d } from "@/shaders/simplex";

const vertex = /* glsl */ `
  ${simplex3d}

  uniform float uTime;
  uniform float uPixelRatio;
  varying float vNoise;

  void main() {
    vec3 n = normalize(position);
    float noise = snoise(n * 1.6 + vec3(uTime * 0.12, uTime * 0.09, 0.0));
    float noise2 = snoise(n * 4.0 - vec3(0.0, uTime * 0.18, 0.0)) * 0.35;
    vec3 p = n * (1.0 + noise * 0.42 + noise2);
    vNoise = noise * 0.5 + 0.5;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (1.6 + vNoise * 2.6) * uPixelRatio * (2.6 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vNoise;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float disc = smoothstep(0.5, 0.05, length(uv));
    vec3 color = mix(uColorA, uColorB, vNoise);
    gl_FragColor = vec4(color, disc * (0.25 + vNoise * 0.6));
  }
`;

function EvolvingField() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color("#00ff88") },
      uColorB: { value: new THREE.Color("#00e5ff") },
    }),
    [],
  );

  const positions = useMemo(() => {
    const count = 1800;
    const arr = new Float32Array(count * 3);
    const hash = (n: number) => {
      const s = Math.sin(n) * 43758.5453;
      return s - Math.floor(s);
    };
    for (let i = 0; i < count; i++) {
      // hashed directions on a unit sphere — the shader shapes the topology
      const theta = hash(i * 12.9898) * Math.PI * 2;
      const phi = Math.acos(2 * hash(i * 78.233 + 1.7) - 1);
      arr[i * 3] = Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = Math.cos(phi);
      arr[i * 3 + 2] = Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  // Imperative material sharing the mutable uniforms object (see particle-globe)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms],
  );

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  useFrame((state, delta) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.25;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <primitive object={material} attach="material" />
      </points>
      <mesh>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export function GenerativeScene({ className }: { className?: string }) {
  return (
    <SceneCanvas className={className} camera={{ position: [0, 0, 3.4], fov: 45 }}>
      <EvolvingField />
    </SceneCanvas>
  );
}
