"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type RGB = { r: number; g: number; b: number };

function hexToRgb(value: string, fallback: RGB): RGB {
  const match = value.trim().match(/^#?([0-9a-f]{6})$/i);

  if (!match) {
    return fallback;
  }

  const n = parseInt(match[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function readPalette() {
  const styles = getComputedStyle(document.documentElement);
  return {
    ink: hexToRgb(styles.getPropertyValue("--color-ink"), { r: 23, g: 21, b: 15 }),
    accent: hexToRgb(styles.getPropertyValue("--color-accent"), { r: 255, g: 77, b: 36 }),
    // Glow reads much stronger on paper than on dark ink — temper it there
    isLight: document.documentElement.getAttribute("data-theme") !== "dark",
  };
}

const SPACING = 30; // dot grid pitch (px)
const SIM_SCALE = 10; // water simulation cell size (px)
const DAMPING = 0.987; // how long ripples live
const WAKE_STRENGTH = 15; // cursor movement disturbance
const DROP_STRENGTH = 520; // click disturbance
const AUTO_DROP_EVERY = 9000; // ms
const DISPLACE = 0.8; // how far dots ride the wave slope
const MAX_DISPLACE = 14; // px

/**
 * Watery background: a real 2D water surface simulation (two-buffer
 * height field) rendered through the editorial dot grid. The cursor carves
 * a wake, clicks drop stones whose rings propagate and fade like water,
 * and dots ride the surface — displaced along the slope, brightened and
 * warmed on crests. Theme-aware via the CSS variables.
 */
export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glow = glowRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !glow || !context) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    let palette = readPalette();
    let width = 0;
    let height = 0;
    let dots: { x: number; y: number; layer: number; cross: boolean }[] = [];
    let frame = 0;

    // Water height field (two buffers, swapped every step)
    let cols = 0;
    let rows = 0;
    let bufferA = new Float32Array(0);
    let bufferB = new Float32Array(0);

    // Low-res luminous layer: the water surface itself, upscaled smooth
    const shade = document.createElement("canvas");
    const shadeContext = shade.getContext("2d");
    let shadeImage: ImageData | null = null;

    const lastPointer = { x: -9999, y: -9999 };
    let lastAutoDrop = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / SIM_SCALE) + 2;
      rows = Math.ceil(height / SIM_SCALE) + 2;
      bufferA = new Float32Array(cols * rows);
      bufferB = new Float32Array(cols * rows);

      shade.width = cols;
      shade.height = rows;
      shadeImage = shadeContext ? shadeContext.createImageData(cols, rows) : null;

      dots = [];
      let iy = 0;

      for (let y = SPACING / 2; y < height + SPACING; y += SPACING, iy++) {
        let ix = 0;
        for (let x = SPACING / 2; x < width + SPACING; x += SPACING, ix++) {
          dots.push({
            x,
            y,
            layer: 0.8 + ((ix + iy * 2) % 3) * 0.15,
            cross: (ix * 7 + iy * 13) % 23 === 0,
          });
        }
      }

      if (reduced) {
        drawStatic();
      }
    };

    const drawStatic = () => {
      context.clearRect(0, 0, width, height);
      const { ink } = palette;
      context.fillStyle = `rgba(${ink.r}, ${ink.g}, ${ink.b}, 0.13)`;

      for (const dot of dots) {
        context.beginPath();
        context.arc(dot.x, dot.y, 1.1, 0, Math.PI * 2);
        context.fill();
      }
    };

    /** Drop a disturbance into the surface at page coordinates */
    const disturb = (x: number, y: number, radius: number, strength: number) => {
      const cx = Math.round(x / SIM_SCALE) + 1;
      const cy = Math.round(y / SIM_SCALE) + 1;

      for (let oy = -radius; oy <= radius; oy++) {
        for (let ox = -radius; ox <= radius; ox++) {
          const d2 = ox * ox + oy * oy;

          if (d2 > radius * radius) {
            continue;
          }

          const tx = cx + ox;
          const ty = cy + oy;

          if (tx < 1 || tx >= cols - 1 || ty < 1 || ty >= rows - 1) {
            continue;
          }

          const falloff = 1 - Math.sqrt(d2) / (radius + 1);
          bufferA[ty * cols + tx] += strength * falloff;
        }
      }
    };

    /** One step of the classic water propagation */
    const stepWater = () => {
      for (let y = 1; y < rows - 1; y++) {
        const row = y * cols;

        for (let x = 1; x < cols - 1; x++) {
          const i = row + x;
          const next =
            (bufferA[i - 1] + bufferA[i + 1] + bufferA[i - cols] + bufferA[i + cols]) * 0.5 -
            bufferB[i];
          bufferB[i] = next * DAMPING;
        }
      }

      const swap = bufferA;
      bufferA = bufferB;
      bufferB = swap;
    };

    const heightAt = (x: number, y: number) => {
      const cx = Math.min(cols - 2, Math.max(1, Math.round(x / SIM_SCALE) + 1));
      const cy = Math.min(rows - 2, Math.max(1, Math.round(y / SIM_SCALE) + 1));
      return bufferA[cy * cols + cx];
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      // A quiet rain: occasional drops keep the water alive when idle
      if (time - lastAutoDrop > AUTO_DROP_EVERY) {
        lastAutoDrop = time;
        disturb(Math.random() * width, Math.random() * height, 2, DROP_STRENGTH * 0.4);
      }

      stepWater();

      const { ink, accent } = palette;
      const t = time * 0.0005;

      // Luminous water surface: crests glow warm, troughs shade with ink.
      // Light mode gets a far gentler wash — full strength looks blotchy on paper.
      if (shadeContext && shadeImage) {
        const data = shadeImage.data;
        const crestCap = palette.isLight ? 54 : 120;
        const crestGain = palette.isLight ? 0.75 : 1.6;
        const troughCap = palette.isLight ? 34 : 90;
        const troughGain = palette.isLight ? 0.45 : 1.1;

        for (let i = 0; i < bufferA.length; i++) {
          const h = bufferA[i];
          const p = i * 4;

          if (h > 0.4) {
            data[p] = accent.r;
            data[p + 1] = accent.g;
            data[p + 2] = accent.b;
            data[p + 3] = Math.min(crestCap, h * crestGain);
          } else if (h < -0.4) {
            data[p] = ink.r;
            data[p + 1] = ink.g;
            data[p + 2] = ink.b;
            data[p + 3] = Math.min(troughCap, -h * troughGain);
          } else {
            data[p + 3] = 0;
          }
        }

        shadeContext.putImageData(shadeImage, 0, 0);
        context.imageSmoothingEnabled = true;
        context.drawImage(
          shade,
          0,
          0,
          cols,
          rows,
          -SIM_SCALE,
          -SIM_SCALE,
          cols * SIM_SCALE,
          rows * SIM_SCALE,
        );
      }

      for (const dot of dots) {
        // Sample the wave and its slope at the dot
        const h = heightAt(dot.x, dot.y);
        const gx = heightAt(dot.x + SIM_SCALE, dot.y) - heightAt(dot.x - SIM_SCALE, dot.y);
        const gy = heightAt(dot.x, dot.y + SIM_SCALE) - heightAt(dot.x, dot.y - SIM_SCALE);

        // Dots slide down the slope — this is what makes rings readable
        const ox = Math.max(-MAX_DISPLACE, Math.min(MAX_DISPLACE, -gx * DISPLACE));
        const oy = Math.max(-MAX_DISPLACE, Math.min(MAX_DISPLACE, -gy * DISPLACE));

        const wave = Math.sin(t + dot.x * 0.011 + dot.y * 0.014);
        const x = dot.x + ox + wave * 1.1 * dot.layer;
        const y = dot.y + oy + Math.cos(t * 0.9 + dot.x * 0.008) * 1.1 * dot.layer;

        // Crests glow warm, troughs stay ink; |slope| adds sparkle
        const crest = Math.max(0, Math.min(1, h * 0.03));
        const energy = Math.min(1, Math.abs(h) * 0.02 + (Math.abs(gx) + Math.abs(gy)) * 0.009);

        const mix = crest * 0.85;
        const r = ink.r + (accent.r - ink.r) * mix;
        const g = ink.g + (accent.g - ink.g) * mix;
        const b = ink.b + (accent.b - ink.b) * mix;

        const alpha =
          0.12 + dot.layer * 0.04 + wave * 0.015 + energy * (palette.isLight ? 0.42 : 0.62);
        const size = 0.9 + dot.layer * 0.25 + energy * (palette.isLight ? 1.5 : 2.1);

        context.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`;

        if (dot.cross) {
          const arm = size * 1.9;
          context.fillRect(x - arm, y - 0.5, arm * 2, 1);
          context.fillRect(x - 0.5, y - arm, 1, arm * 2);
        } else {
          context.beginPath();
          context.arc(x, y, size, 0, Math.PI * 2);
          context.fill();
        }
      }

      frame = requestAnimationFrame(draw);
    };

    const observer = new MutationObserver(() => {
      palette = readPalette();

      if (reduced) {
        drawStatic();
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("resize", resize);
    resize();

    if (reduced) {
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", resize);
      };
    }

    const glowX = gsap.quickTo(glow, "x", { duration: 1.3, ease: "power3.out" });
    const glowY = gsap.quickTo(glow, "y", { duration: 1.3, ease: "power3.out" });

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;

      // The wake: a gentle trail — only meaningful movement disturbs the water
      if (lastPointer.x > -4000) {
        const travel = Math.hypot(x - lastPointer.x, y - lastPointer.y);

        if (travel > 5) {
          const steps = Math.min(4, Math.max(1, Math.round(travel / (SIM_SCALE * 2))));
          const strength = Math.min(WAKE_STRENGTH * 1.5, WAKE_STRENGTH * (0.3 + travel * 0.03));

          for (let s = 0; s < steps; s++) {
            const mix = steps === 1 ? 1 : s / (steps - 1);
            disturb(
              lastPointer.x + (x - lastPointer.x) * mix,
              lastPointer.y + (y - lastPointer.y) * mix,
              1,
              strength / steps,
            );
          }
        }
      }

      lastPointer.x = x;
      lastPointer.y = y;

      if (finePointer) {
        glowX(x);
        glowY(y);
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      disturb(event.clientX, event.clientY, 3, DROP_STRENGTH);
    };

    const onPointerLeave = () => {
      lastPointer.x = -9999;
      lastPointer.y = -9999;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      {/* Cursor-trailing glow, kept faint */}
      <div
        ref={glowRef}
        className="absolute left-0 top-0 size-[52vmax] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[var(--glow-opacity)] blur-[100px] transition-opacity duration-500 will-change-transform"
        style={{
          background:
            "radial-gradient(circle at 42% 42%, var(--color-accent), transparent 50%), radial-gradient(circle at 62% 62%, var(--color-violet), transparent 56%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
