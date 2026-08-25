"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import type { HologramKind } from "@/data/projects";

const SIGNAL = "#00ff88";
const CYAN = "#00e5ff";

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

/* Each project gets its own live mini-visualization, drawn from its domain. */

const drawOccupancy: DrawFn = (ctx, w, h, t) => {
  // hostel room grid with live occupancy
  const cols = 7;
  const rows = 4;
  const pad = w * 0.08;
  const cw = (w - pad * 2) / cols;
  const ch = (h - pad * 2.4) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = pad + c * cw;
      const y = pad + r * ch;
      const seed = Math.sin(r * 17.3 + c * 9.1) * 0.5 + 0.5;
      const occupied = Math.sin(t * 0.5 + seed * 20) > seed - 0.5;
      ctx.strokeStyle = "rgba(0,255,136,0.35)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 3, y + 3, cw - 6, ch - 6);
      if (occupied) {
        const pulse = 0.5 + 0.3 * Math.sin(t * 2 + seed * 30);
        ctx.fillStyle = `rgba(0,255,136,${0.14 * pulse + 0.08})`;
        ctx.fillRect(x + 3, y + 3, cw - 6, ch - 6);
        ctx.fillStyle = SIGNAL;
        ctx.fillRect(x + cw / 2 - 1.5, y + ch / 2 - 1.5, 3, 3);
      }
    }
  }

  ctx.fillStyle = SIGNAL;
  ctx.font = "10px monospace";
  const pct = Math.round(72 + Math.sin(t * 0.4) * 6);
  ctx.fillText(`OCCUPANCY ${pct}%`, pad, h - pad * 0.5);
  ctx.fillStyle = "rgba(156,163,175,0.9)";
  ctx.fillText("TRUEHOSTEL.IN // LIVE", w - pad - 118, h - pad * 0.5);
};

const drawChat: DrawFn = (ctx, w, h, t) => {
  // chat widget conversation stream
  const pad = w * 0.09;
  const rowH = h * 0.11;
  const messages = 6;

  for (let i = 0; i < messages; i++) {
    const phase = (t * 0.55 + i * 0.9) % (messages * 0.9);
    const appear = Math.min(1, phase);
    const y = pad + i * rowH * 1.15;
    const isAgent = i % 2 === 0;
    const bw = (w * 0.32 + Math.sin(i * 7.7) * w * 0.08) * appear;
    const x = isAgent ? pad : w - pad - bw;

    ctx.fillStyle = isAgent ? "rgba(0,255,136,0.14)" : "rgba(0,229,255,0.12)";
    ctx.strokeStyle = isAgent ? "rgba(0,255,136,0.5)" : "rgba(0,229,255,0.5)";
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(bw, 4), rowH * 0.8, 3);
    ctx.fill();
    ctx.stroke();
  }

  // typing indicator
  const ty = pad + messages * rowH * 1.15;
  for (let d = 0; d < 3; d++) {
    const bounce = Math.sin(t * 5 + d * 0.9) * 2;
    ctx.fillStyle = SIGNAL;
    ctx.beginPath();
    ctx.arc(pad + 8 + d * 10, ty + 6 + bounce, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(156,163,175,0.9)";
  ctx.font = "10px monospace";
  ctx.fillText("MULTI-TENANT // SOCKET.IO", pad, h - pad * 0.4);
};

const drawEditor: DrawFn = (ctx, w, h, t) => {
  // pair-programming editor: code bars + two live cursors
  const pad = w * 0.09;
  const lines = 11;
  const lh = (h - pad * 2.6) / lines;

  for (let i = 0; i < lines; i++) {
    const y = pad + i * lh;
    const indent = (i % 4) * 14;
    const lw = (w * 0.35 + Math.abs(Math.sin(i * 5.3)) * w * 0.3) *
      Math.min(1, Math.max(0, t * 0.9 - i * 0.28));
    ctx.fillStyle = i % 3 === 0 ? "rgba(0,229,255,0.4)" : "rgba(0,255,136,0.3)";
    ctx.fillRect(pad + 22 + indent, y, Math.max(0, lw - indent), 4);
    ctx.fillStyle = "rgba(86,98,112,0.8)";
    ctx.font = "8px monospace";
    ctx.fillText(String(i + 1).padStart(2, "0"), pad, y + 5);
  }

  // two collaborating cursors
  const c1 = Math.floor((Math.sin(t * 0.6) * 0.5 + 0.5) * (lines - 1));
  const c2 = Math.floor((Math.sin(t * 0.45 + 2.2) * 0.5 + 0.5) * (lines - 1));
  if (Math.sin(t * 6) > -0.3) {
    ctx.fillStyle = SIGNAL;
    ctx.fillRect(pad + 30 + (c1 % 4) * 14 + 60, pad + c1 * lh - 3, 2, 10);
  }
  if (Math.sin(t * 6 + 1) > -0.3) {
    ctx.fillStyle = CYAN;
    ctx.fillRect(pad + 30 + (c2 % 4) * 14 + 110, pad + c2 * lh - 3, 2, 10);
  }

  ctx.fillStyle = "rgba(156,163,175,0.9)";
  ctx.font = "10px monospace";
  ctx.fillText("PAIR MODE // JUDGE0", pad, h - pad * 0.4);
};

const drawQr: DrawFn = (ctx, w, h, t) => {
  // mutating QR matrix
  const size = Math.min(w, h) * 0.62;
  const ox = (w - size) / 2;
  const oy = (h - size) / 2 - h * 0.04;
  const cells = 15;
  const cs = size / cells;

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const seed = Math.sin(r * 12.9 + c * 78.2) * 43758.54;
      const on = (seed - Math.floor(seed)) > 0.5;
      const flicker = Math.sin(t * 1.5 + r * 3 + c * 5) > 0.93;
      if (on !== flicker) {
        ctx.fillStyle = "rgba(0,255,136,0.75)";
        ctx.fillRect(ox + c * cs + 0.5, oy + r * cs + 0.5, cs - 1, cs - 1);
      }
    }
  }

  // finder squares
  ctx.strokeStyle = SIGNAL;
  ctx.lineWidth = 2;
  for (const [fx, fy] of [[0, 0], [cells - 4, 0], [0, cells - 4]] as const) {
    ctx.strokeRect(ox + fx * cs, oy + fy * cs, cs * 4, cs * 4);
  }

  // scan beam
  const scanY = oy + ((t * 40) % size);
  ctx.fillStyle = "rgba(0,229,255,0.18)";
  ctx.fillRect(ox, scanY, size, 3);

  ctx.fillStyle = "rgba(156,163,175,0.9)";
  ctx.font = "10px monospace";
  ctx.fillText("GENERATE // DECODE // TRACK", ox, h - h * 0.06);
};

const DRAWERS: Record<HologramKind, DrawFn> = {
  occupancy: drawOccupancy,
  chat: drawChat,
  editor: drawEditor,
  qr: drawQr,
};

type ProjectHologramProps = {
  kind: HologramKind;
  title: string;
};

/** 3D-tilting holographic preview panel with a live per-project canvas viz. */
export function ProjectHologram({ kind, title }: ProjectHologramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(0);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 120, damping: 16 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 120, damping: 16 });

  useEffect(() => {
    startRef.current = performance.now();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let raf = 0;
    let running = true;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = (now: number) => {
      if (!running) return;
      const w = (canvas.width = canvas.offsetWidth * 2);
      const h = (canvas.height = canvas.offsetHeight * 2);
      ctx.clearRect(0, 0, w, h);
      DRAWERS[kind](ctx, w, h, (now - startRef.current) / 1000 + 2);
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [kind]);

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - rect.left) / rect.width);
          my.set((e.clientY - rect.top) / rect.height);
        }}
        onPointerLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}
        className="sys-panel sys-corners relative overflow-hidden"
        data-cursor="OPEN"
      >
        <div className="flex items-center gap-1.5 border-b border-line px-3 py-2">
          <span className="size-1.5 rounded-full bg-signal/70" />
          <span className="size-1.5 rounded-full bg-cyan/50" />
          <span className="size-1.5 rounded-full bg-dim" />
          <span className="ml-2 font-mono text-[9px] tracking-[0.16em] text-dim">
            {title.toUpperCase()}.SYS
          </span>
        </div>

        <canvas ref={canvasRef} className="aspect-[4/3] w-full" aria-hidden="true" />

        {/* holographic scanlines + glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(to bottom, transparent 0 3px, rgba(0,0,0,0.16) 3px 4px), radial-gradient(ellipse at 50% 40%, rgba(0,255,136,0.06), transparent 70%)",
          }}
        />
      </motion.div>
    </div>
  );
}
