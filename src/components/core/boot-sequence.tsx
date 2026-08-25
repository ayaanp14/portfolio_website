"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

import { useSystemStore } from "@/lib/system-store";
import { prefersReducedMotion } from "@/lib/quality";

const BOOT_LINES = [
  "INITIALIZING SYSTEM...",
  "LOADING GRAPHICS ENGINE...",
  "LOADING PARTICLE NETWORK...",
  "CONNECTING DATA LAYERS...",
  "INITIALIZING USER INTERFACE...",
  "CALIBRATING 3D ENVIRONMENT...",
];

/**
 * Cinematic system boot: black screen → grid draws → particles converge →
 * boot log → SYSTEM READY → wipe. Click skips. Reduced motion boots instantly.
 */
export function BootSequence() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef<HTMLParagraphElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [done, setDone] = useState(false);
  const setBooted = useSystemStore((s) => s.setBooted);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const id = requestAnimationFrame(() => {
        setBooted(true);
        setDone(true);
      });
      return () => cancelAnimationFrame(id);
    }

    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    const log = logRef.current;
    if (!overlay || !canvas || !log) return;

    /* -- background canvas: grid drawing itself + converging particles -- */
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let running = true;
    const start = performance.now();
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 0.2 + Math.random() * 0.8,
    }));

    const draw = (now: number) => {
      if (!ctx || !running) return;
      const w = (canvas.width = canvas.offsetWidth);
      const h = (canvas.height = canvas.offsetHeight);
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);

      // grid draws outward from the horizon
      const reach = Math.min(1, t / 1.6);
      ctx.strokeStyle = "rgba(0,255,136,0.07)";
      ctx.lineWidth = 1;
      const cells = 14;
      for (let i = 0; i <= cells; i++) {
        const p = i / cells;
        if (p > reach) continue;
        ctx.beginPath();
        ctx.moveTo(0, h * p);
        ctx.lineTo(w * reach, h * p);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * p, 0);
        ctx.lineTo(w * p, h * reach);
        ctx.stroke();
      }

      // particles drift toward the center
      const cx = w / 2;
      const cy = h / 2;
      ctx.fillStyle = "rgba(0,255,136,0.8)";
      for (const p of particles) {
        const pull = Math.min(1, t / 3.4) * 0.6;
        const px = p.x * w + (cx - p.x * w) * pull;
        const py = p.y * h + (cy - p.y * h) * pull;
        const size = p.s * (1 + Math.sin(t * 3 + p.x * 20) * 0.4);
        ctx.globalAlpha = 0.25 + p.s * 0.5;
        ctx.fillRect(px, py, size, size);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    /* -- master boot timeline -- */
    const lines = Array.from(log.children) as HTMLElement[];
    const progress = { value: 0 };

    const tl = gsap.timeline({
      onComplete: () => {
        setBooted(true);
        setDone(true);
      },
    });
    timelineRef.current = tl;

    tl.set(overlay, { opacity: 1 });

    lines.forEach((line, i) => {
      const at = 0.35 + i * 0.42;
      tl.set(line, { opacity: 1 }, at);
      tl.to(
        line.querySelector("[data-status]"),
        { opacity: 1, duration: 0.01 },
        at + 0.3,
      );
    });

    tl.to(
      progress,
      {
        value: 100,
        duration: 0.35 + BOOT_LINES.length * 0.42 + 0.3,
        ease: "power1.inOut",
        onUpdate: () => {
          const v = Math.round(progress.value);
          if (barRef.current) barRef.current.style.width = `${v}%`;
          if (percentRef.current) percentRef.current.textContent = `${v}%`;
          useSystemStore.getState().setBootProgress(v / 100);
        },
      },
      0.2,
    );

    tl.set(readyRef.current, { opacity: 1 }, ">-0.1");
    tl.fromTo(
      readyRef.current,
      { scale: 0.96 },
      { scale: 1, duration: 0.3, ease: "power2.out" },
      "<",
    );

    // final wipe: the console powers into the page
    tl.to(
      overlay,
      {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.7,
        ease: "power3.inOut",
      },
      "+=0.45",
    );

    const skip = () => tl.progress(1);
    overlay.addEventListener("pointerdown", skip);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      overlay.removeEventListener("pointerdown", skip);
      tl.kill();
    };
  }, [setBooted]);

  if (done) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-void"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-label="System booting"
      role="status"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      <div className="relative z-10 w-[min(480px,88vw)]">
        <p className="sys-label mb-6 flex items-center gap-2">
          <span className="status-dot" />
          AYAAN.PATHAN // SYSTEM BOOT
        </p>

        <div ref={logRef} className="min-h-[168px] space-y-1.5">
          {BOOT_LINES.map((line) => (
            <p
              key={line}
              className="flex justify-between font-mono text-[12px] tracking-[0.08em] text-muted opacity-0"
            >
              <span>{line}</span>
              <span data-status className="text-signal opacity-0">
                [ OK ]
              </span>
            </p>
          ))}
          <p
            ref={readyRef}
            className="sys-heading pt-3 text-[15px] font-semibold tracking-[0.2em] text-signal opacity-0 text-glow"
          >
            SYSTEM READY
          </p>
        </div>

        <div className="mt-8">
          <div className="h-px w-full bg-line-soft">
            <div ref={barRef} className="h-px w-0 bg-signal shadow-[0_0_8px_#00ff88]" />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] tracking-[0.14em] text-dim">
            <span>BOOT SEQUENCE v2.6</span>
            <span ref={percentRef}>0%</span>
          </div>
        </div>

        <p className="mt-10 text-center font-mono text-[10px] tracking-[0.2em] text-dim">
          [ CLICK TO SKIP ]
        </p>
      </div>
    </div>
  );
}
