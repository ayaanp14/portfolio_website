"use client";

import { useEffect, useRef, useState } from "react";
import { FiGithub } from "react-icons/fi";

import { SysPanel } from "@/components/core/panel";
import { profile } from "@/data/profile";

type GithubStats = {
  repos: string;
  years: string;
};

const FALLBACK: GithubStats = { repos: "20+", years: "3+" };

/** `// GITHUB ACTIVITY` — live public stats orbiting the GitHub core. */
export function GithubActivity() {
  const [stats, setStats] = useState<GithubStats>(FALLBACK);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live public profile stats (unauthenticated GitHub API; falls back silently)
  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.github.com/users/${profile.githubUser}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const created = new Date(data.created_at).getFullYear();
        const years = Math.max(1, new Date().getFullYear() - created);
        setStats({
          repos: `${data.public_repos}+`,
          years: `${years}+`,
        });
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // orbital rings + travelling commits
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let running = true;

    const draw = (now: number) => {
      if (!running) return;
      const w = (canvas.width = canvas.offsetWidth * 2);
      const h = (canvas.height = canvas.offsetHeight * 2);
      const t = now / 1000;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      for (let ring = 0; ring < 4; ring++) {
        const r = (Math.min(w, h) / 2) * (0.3 + ring * 0.17);
        ctx.strokeStyle = "rgba(0,255,136,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // orbiting commit points
        const count = 2 + ring;
        for (let i = 0; i < count; i++) {
          const a = t * (0.3 + ring * 0.12) * (ring % 2 ? -1 : 1) + (i / count) * Math.PI * 2;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          ctx.fillStyle = i === 0 ? "#00e5ff" : "#00ff88";
          ctx.shadowColor = "rgba(0,255,136,0.8)";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x, y, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  const rows = [
    { value: stats.repos, label: "Repositories" },
    { value: "20+", label: "Technologies" },
    { value: "2", label: "SaaS in Production" },
    { value: stats.years, label: "Years on GitHub" },
  ];

  return (
    <SysPanel
      title="GITHUB ACTIVITY"
      className="flex flex-col"
      bodyClassName="flex min-h-[380px] flex-1 items-center gap-5 p-5"
    >
      <div className="relative h-full min-h-[220px] flex-1">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        <a
          href={profile.links.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile"
          data-cursor="OPEN"
          className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-signal/50 bg-void text-ink transition-colors hover:text-signal"
        >
          <FiGithub size={20} aria-hidden="true" />
        </a>
      </div>

      <ul className="w-[45%] space-y-4">
        {rows.map((row) => (
          <li key={row.label}>
            <p className="sys-heading text-[24px] font-bold text-signal text-glow-soft">
              {row.value}
            </p>
            <p className="font-mono text-[10px] tracking-[0.12em] text-dim">{row.label}</p>
          </li>
        ))}
      </ul>
    </SysPanel>
  );
}
