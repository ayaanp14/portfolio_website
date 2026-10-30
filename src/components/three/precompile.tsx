"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

/**
 * Warms the GPU as soon as the scene mounts (behind the loader): compiles
 * every material, then renders one frame so shadow-map and environment
 * shaders are built too. Without this, the first frame on screen stalls.
 */
export function Precompile() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    gl.compile(scene, camera);
    gl.render(scene, camera);
  }, [gl, scene, camera]);
  return null;
}
