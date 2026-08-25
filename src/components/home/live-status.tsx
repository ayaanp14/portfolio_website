"use client";

import { useEffect, useRef } from "react";

import { SysPanel } from "@/components/core/panel";

const METRICS = [
  { label: "Performance", value: "98.7%", speed: 1.0, base: 0.75 },
  { label: "Response Time", value: "120ms", speed: 1.6, base: 0.5 },
  { label: "Uptime", value: "99.99%", speed: 0.7, base: 0.85 },
] as const;

/** `// LIVE.STATUS` — continuously animating sparkline dashboard. */
export function LiveStatus() {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let running = true;

    const draw = (now: number) => {
      if (!running) return;
      const t = now / 1000;

      canvasRefs.current.forEach((canvas, mi) => {
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        const w = (canvas.width = canvas.offsetWidth * 2);
        const h = (canvas.height = canvas.offsetHeight * 2);
        const { speed, base } = METRICS[mi];

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = "#00ff88";
        ctx.lineWidth = 2;
        ctx.shadowColor = "rgba(0,255,136,0.6)";
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const steps = 40;
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * w;
          const phase = t * speed + i * 0.45;
          const y =
            h -
            (base +
              Math.sin(phase) * 0.1 +
              Math.sin(phase * 2.3 + 1.7) * 0.06 +
              Math.sin(phase * 5.1) * 0.03) *
              h *
              0.8;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <SysPanel title="LIVE.STATUS">
      <div className="space-y-3">
        {METRICS.map((metric, i) => (
          <div key={metric.label} className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.1em] text-dim">{metric.label}</p>
              <p className="font-mono text-[15px] font-semibold text-signal text-glow-soft">
                {metric.value}
              </p>
            </div>
            <canvas
              ref={(el) => {
                canvasRefs.current[i] = el;
              }}
              className="h-8 w-24"
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </SysPanel>
  );
}
