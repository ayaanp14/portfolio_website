"use client";

import { useEffect, useRef } from "react";

/**
 * Persistent world background: faint technical grid + drifting particles +
 * a slow scan sweep. One lightweight 2D canvas behind everything.
 */
export function BackgroundGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let running = true;
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00012,
      vy: -0.00004 - Math.random() * 0.00012,
      s: 0.4 + Math.random() * 1.1,
    }));

    let scrollY = 0;
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const draw = (now: number) => {
      if (!running) return;
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);
      const t = now / 1000;
      ctx.clearRect(0, 0, w, h);

      // grid, parallaxed slightly against scroll
      const cell = 64;
      const offset = (scrollY * 0.06) % cell;
      ctx.strokeStyle = "rgba(0,255,136,0.035)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += cell) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
      for (let y = -cell; y < h + cell; y += cell) {
        ctx.beginPath();
        ctx.moveTo(0, y - offset + 0.5);
        ctx.lineTo(w, y - offset + 0.5);
        ctx.stroke();
      }

      // drifting particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        const flicker = 0.5 + 0.5 * Math.sin(t * 2 + p.x * 40);
        ctx.globalAlpha = 0.12 + flicker * 0.2;
        ctx.fillStyle = flicker > 0.85 ? "#00e5ff" : "#00ff88";
        ctx.fillRect(p.x * w, p.y * h, p.s, p.s);
      }
      ctx.globalAlpha = 1;

      // slow scan sweep
      const scanY = ((t * 26) % (h + 300)) - 150;
      const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      grad.addColorStop(0, "rgba(0,255,136,0)");
      grad.addColorStop(0.5, "rgba(0,255,136,0.022)");
      grad.addColorStop(1, "rgba(0,255,136,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 60, w, 120);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 h-full w-full"
    />
  );
}
