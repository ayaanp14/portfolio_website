import type Lenis from "lenis";

/**
 * Shared handle to the active Lenis instance so components can drive
 * programmatic scrolls through the same easing pipeline. Null when smooth
 * scrolling is disabled (reduced motion) or not yet mounted.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
