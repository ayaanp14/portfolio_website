const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&/<>[]{}=+*_";

/**
 * Scramble-decode a string into an element's textContent.
 * Returns a cancel function. Non-destructive: restores the final text.
 */
export function scrambleText(
  el: HTMLElement,
  finalText: string,
  duration = 600,
): () => void {
  const length = finalText.length;
  const start = performance.now();
  let frame = 0;
  let raf = 0;

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const settled = Math.floor(progress * length);
    let out = finalText.slice(0, settled);

    for (let i = settled; i < length; i++) {
      const ch = finalText[i];
      out += ch === " " ? " " : GLYPHS[(frame + i * 7) % GLYPHS.length];
    }

    el.textContent = out;
    frame++;

    if (progress < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      el.textContent = finalText;
    }
  };

  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    el.textContent = finalText;
  };
}
