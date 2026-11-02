import type Lenis from "lenis";

/**
 * Shared handle to the active Lenis instance so components can drive
 * programmatic scrolls through the same easing pipeline. Null when smooth
 * scrolling is disabled (reduced motion) or not yet mounted.
 */
let instance: Lenis | null = null;
const listeners = new Set<(lenis: Lenis) => void>();

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
  if (lenis) listeners.forEach((fn) => fn(lenis));
}

export function getLenis(): Lenis | null {
  return instance;
}

/**
 * Runs `fn` with the Lenis instance — now if it exists, otherwise as soon as
 * it is created. Child components mount before the provider that creates
 * Lenis, so this is how they wait for it. Returns an unsubscribe function.
 */
export function onLenis(fn: (lenis: Lenis) => void): () => void {
  if (instance) {
    fn(instance);
    return () => {};
  }
  const once = (lenis: Lenis) => {
    listeners.delete(once);
    fn(lenis);
  };
  listeners.add(once);
  return () => listeners.delete(once);
}
