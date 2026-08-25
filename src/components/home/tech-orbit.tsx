"use client";

import { useEffect, useRef, useState } from "react";

import { SysPanel } from "@/components/core/panel";
import { skillsData, type SkillCategory, type SkillNode } from "@/data/skills";

/** All skills, distributed across three orbital rings (inner = core stack). */
const ORBIT_IDS = [
  ["react", "nodejs", "mongodb", "express", "javascript"],
  ["tailwindcss", "socketio", "jwt", "rest-api", "postgresql", "mysql", "prisma"],
  ["mui", "framer-motion", "azure", "github-actions", "railway", "git", "java", "python", "cpp", "postman"],
] as const;

/** Brand accent per skill — icons and glows use the real identity colors. */
const SKILL_COLORS: Record<string, string> = {
  react: "#61dafb",
  javascript: "#f7df1e",
  tailwindcss: "#38bdf8",
  mui: "#007fff",
  "framer-motion": "#d54cff",
  nodejs: "#5fa04e",
  express: "#d7e0dd",
  "rest-api": "#6ee7b7",
  socketio: "#eef7f2",
  jwt: "#fb015b",
  mongodb: "#47a248",
  mysql: "#de8a03",
  postgresql: "#699eca",
  prisma: "#8fa4ff",
  azure: "#2fa8e0",
  "github-actions": "#2088ff",
  railway: "#c084fc",
  git: "#f05033",
  java: "#e76f00",
  python: "#6aa8d8",
  cpp: "#659ad2",
  postman: "#ff6c37",
};

const CATEGORIES: SkillCategory[] = [
  "Frontend",
  "Backend",
  "Database",
  "Languages",
  "Cloud & DevOps",
  "Tools",
];

const skillById = new Map(skillsData.map((s) => [s.id, s]));

type OrbitItem = {
  skill: SkillNode;
  ring: number;
  phase: number;
};

type NodePos = { x: number; y: number; depth: number };

/**
 * `// TECHNOLOGY STACK` — a spatial constellation of the real stack orbiting
 * a core: brand-colored nodes on three counter-rotating rings, live
 * connection lines to related tech on hover, category filtering, and a
 * proficiency readout in the inspector below.
 */
export function TechOrbit() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const positionsRef = useRef<Map<string, NodePos>>(new Map());
  const starsRef = useRef<{ x: number; y: number; r: number; p: number }[] | null>(null);

  const [hovered, setHovered] = useState<SkillNode | null>(null);
  const hoveredRef = useRef<SkillNode | null>(null);
  const [category, setCategory] = useState<SkillCategory | null>(null);
  const categoryRef = useRef<SkillCategory | null>(null);

  const items: OrbitItem[] = ORBIT_IDS.flatMap((ids, ring) =>
    ids
      .map((id, i) => {
        const skill = skillById.get(id);
        return skill ? { skill, ring, phase: (i / ids.length) * Math.PI * 2 } : null;
      })
      .filter((v): v is OrbitItem => v !== null),
  );

  const pick = (skill: SkillNode | null) => {
    hoveredRef.current = skill;
    setHovered(skill);
  };

  const filter = (next: SkillCategory | null) => {
    const value = categoryRef.current === next ? null : next;
    categoryRef.current = value;
    setCategory(value);
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    let angle = 0;
    let last = 0;

    const tick = (now: number) => {
      if (!running) return;
      const host = hostRef.current;
      const canvas = canvasRef.current;
      const dt = last === 0 ? 0 : (now - last) / 1000;
      last = now;
      if (!host || !canvas) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const w = host.offsetWidth;
      const h = host.offsetHeight;
      const cx = w / 2;
      const cy = h / 2;
      const hoveredSkill = hoveredRef.current;
      const activeCategory = categoryRef.current;

      // orbit slows to a crawl while inspecting a node
      angle += dt * (hoveredSkill ? 0.05 : 0.3);

      // narrow screens: rounder orbits + smaller nodes so 22 tiles don't
      // pile up in the middle
      const narrow = w < 480;

      /* ---- node placement ---- */
      for (const item of items) {
        const el = itemRefs.current.get(item.skill.id);
        if (!el) continue;
        const dir = item.ring % 2 === 0 ? 1 : -1;
        const a = angle * dir * (1 - item.ring * 0.18) + item.phase;
        const rx = Math.min(w, 460) * (0.2 + item.ring * 0.125);
        const ry = rx * (narrow ? 0.52 : 0.4);
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        const depth = (Math.sin(a) + 1) / 2; // 0 back, 1 front
        positionsRef.current.set(item.skill.id, { x, y, depth });

        const color = SKILL_COLORS[item.skill.id] ?? "#7dffd8";
        const isHovered = hoveredSkill?.id === item.skill.id;
        const isRelated = hoveredSkill?.related.includes(item.skill.id) ?? false;
        const inCategory = activeCategory === null || item.skill.category === activeCategory;

        let opacity = 0.4 + depth * 0.6;
        let grayscale = false;
        if (hoveredSkill) {
          if (isHovered) opacity = 1;
          else if (isRelated) opacity = 0.95;
          else opacity = 0.2;
        } else if (!inCategory) {
          opacity = 0.14;
          grayscale = true;
        }

        const scale =
          (0.66 + depth * 0.42) *
          (item.ring === 0 ? 1.08 : 1) *
          (isHovered ? 1.32 : isRelated ? 1.12 : 1) *
          (narrow ? 0.8 : 1);

        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(Math.round(depth * 20) + (isHovered ? 40 : isRelated ? 25 : 0));
        el.style.filter = grayscale ? "grayscale(1)" : "none";
        el.style.borderColor = isHovered || isRelated ? color : "rgba(120,255,210,0.14)";
        el.style.boxShadow = isHovered
          ? `0 0 20px ${color}59, 0 0 5px ${color}a6`
          : isRelated
            ? `0 0 12px ${color}40`
            : "none";
      }

      /* ---- canvas: stars + connection lines ---- */
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        // twinkling backdrop
        if (!starsRef.current) {
          starsRef.current = Array.from({ length: 46 }, () => ({
            x: Math.random(),
            y: Math.random(),
            r: 0.4 + Math.random() * 1.1,
            p: Math.random() * Math.PI * 2,
          }));
        }
        for (const s of starsRef.current) {
          const tw = 0.5 + 0.5 * Math.sin(now / 900 + s.p);
          ctx.fillStyle = `rgba(125,255,216,${0.05 + 0.09 * tw})`;
          ctx.beginPath();
          ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // faint spokes anchoring the core stack to the center
        for (const id of ORBIT_IDS[0]) {
          const pos = positionsRef.current.get(id);
          if (!pos) continue;
          ctx.strokeStyle = `rgba(0,255,136,${0.04 + pos.depth * 0.05})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        }

        // hovered node: bright links to its related tech + the core
        if (hoveredSkill) {
          const from = positionsRef.current.get(hoveredSkill.id);
          if (from) {
            const color = SKILL_COLORS[hoveredSkill.id] ?? "#00ff88";

            ctx.strokeStyle = "rgba(0,255,136,0.22)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(cx, cy);
            ctx.stroke();

            for (const rid of hoveredSkill.related) {
              const to = positionsRef.current.get(rid);
              if (!to) continue;
              const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
              grad.addColorStop(0, `${color}cc`);
              grad.addColorStop(1, "rgba(0,255,136,0.35)");
              ctx.strokeStyle = grad;
              ctx.lineWidth = 1.4;
              ctx.beginPath();
              ctx.moveTo(from.x, from.y);
              ctx.lineTo(to.x, to.y);
              ctx.stroke();

              ctx.fillStyle = "rgba(0,255,136,0.9)";
              ctx.beginPath();
              ctx.arc(to.x, to.y, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      if (!reduced) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    // items is rebuilt every render but is stable in content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SysPanel title="TECHNOLOGY STACK" className="flex flex-col" bodyClassName="flex flex-1 flex-col p-0">
      {/* category filters */}
      <div className="flex flex-wrap gap-1.5 border-b border-line px-4 py-2.5">
        <button
          type="button"
          onClick={() => filter(null)}
          data-cursor="FILTER"
          className={`border px-2 py-1 font-mono text-[9px] tracking-[0.14em] transition-colors ${
            category === null
              ? "border-signal bg-signal/10 text-signal"
              : "border-line text-dim hover:text-muted"
          }`}
        >
          ALL
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => filter(c)}
            data-cursor="FILTER"
            className={`border px-2 py-1 font-mono text-[9px] tracking-[0.14em] transition-colors ${
              category === c
                ? "border-signal bg-signal/10 text-signal"
                : "border-line text-dim hover:text-muted"
            }`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      <div ref={hostRef} className="relative h-[340px] overflow-hidden">
        {/* ambient glow behind the constellation */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,150,0.07),transparent_62%)]"
        />

        {/* orbit guide rings */}
        {[0, 1, 2].map((ring) => (
          <div
            key={ring}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 aspect-[1/0.4] max-[480px]:aspect-[1/0.52] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-line"
            style={{
              width: `${(0.2 + ring * 0.125) * 2 * 100}%`,
              maxWidth: 460 * (0.4 + ring * 0.25),
            }}
          />
        ))}

        {/* stars + connection lines */}
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />

        {/* central core */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 size-[86px] -translate-x-1/2 -translate-y-1/2 animate-[spin_16s_linear_infinite] rounded-full border border-dashed border-signal/25"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-signal/60 bg-void/85 shadow-[0_0_26px_rgba(0,255,136,0.28)]"
          style={{ clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)" }}
        >
          <span className="sys-heading text-[13px] font-bold text-signal text-glow">AP</span>
        </div>

        {items.map((item) => {
          const Icon = item.skill.icon;
          const color = SKILL_COLORS[item.skill.id] ?? "#7dffd8";
          return (
            <button
              key={item.skill.id}
              type="button"
              ref={(el) => {
                if (el) itemRefs.current.set(item.skill.id, el);
                else itemRefs.current.delete(item.skill.id);
              }}
              onPointerEnter={() => pick(item.skill)}
              onPointerLeave={() => pick(null)}
              onFocus={() => pick(item.skill)}
              onBlur={() => pick(null)}
              data-cursor="INSPECT"
              aria-label={item.skill.name}
              className={`absolute left-0 top-0 flex items-center justify-center rounded-md border bg-panel/95 ${
                item.ring === 0 ? "size-11" : item.ring === 1 ? "size-10" : "size-9"
              }`}
              style={{ borderColor: "rgba(120,255,210,0.14)", color }}
            >
              <Icon size={item.ring === 0 ? 19 : 16} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {/* inspector */}
      <div className="min-h-[96px] border-t border-line p-4">
        {hovered ? (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <p
                className="font-mono text-[11px] tracking-[0.14em]"
                style={{ color: SKILL_COLORS[hovered.id] ?? "#00ff88" }}
              >
                &gt; {hovered.name.toUpperCase()}
              </p>
              <span className="font-mono text-[9px] tracking-[0.14em] text-dim">
                {hovered.category.toUpperCase()}
              </span>
            </div>
            <p className="mt-1 font-mono text-[10.5px] leading-relaxed text-muted">
              {hovered.description}
            </p>
            <div className="mt-2.5 flex items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden bg-line">
                <div
                  className="h-full bg-gradient-to-r from-signal/60 to-signal shadow-[0_0_8px_#00ff88] transition-[width] duration-500"
                  style={{ width: `${hovered.level * 100}%` }}
                />
              </div>
              <span className="font-mono text-[9.5px] text-signal">
                {Math.round(hovered.level * 100)}%
              </span>
            </div>
            {hovered.related.length > 0 && (
              <p className="mt-2 font-mono text-[9px] tracking-[0.1em] text-dim">
                LINKED:{" "}
                <span className="text-muted">
                  {hovered.related
                    .map((id) => skillById.get(id)?.name)
                    .filter(Boolean)
                    .join(" / ")}
                </span>
              </p>
            )}
          </>
        ) : (
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-mono text-[10.5px] text-dim">&gt; hover a node to inspect_</p>
            <p className="font-mono text-[9px] tracking-[0.14em] text-dim">
              {skillsData.length} MODULES LOADED
            </p>
          </div>
        )}
      </div>
    </SysPanel>
  );
}
