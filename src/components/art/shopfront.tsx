import Image from "next/image";
import { useId } from "react";

import type { ProjectData } from "@/data/projects";
import { blue } from "@/styles/palette";
import { stackWithIcons } from "@/lib/tech-icons";
import { cn } from "@/lib/cn";

/** Scalloped blue/white awning */
function Awning() {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="relative z-10 -mx-[3%] block h-[18%] w-[106%] drop-shadow-[0_6px_8px_rgba(0,0,0,0.45)]" preserveAspectRatio="none" viewBox="0 0 400 60" aria-hidden="true">
      <defs>
        <pattern id={`aw-${id}`} width={50} height={60} patternUnits="userSpaceOnUse">
          <rect width={25} height={38} fill={blue[800]} />
          <rect x={25} width={25} height={38} fill="#F5F5F5" />
          <path d="M0 38 H25 V40 A12.5 12.5 0 0 1 0 40 Z" fill={blue[800]} />
          <path d="M25 38 H50 V40 A12.5 12.5 0 0 1 25 40 Z" fill="#F5F5F5" />
        </pattern>
        <linearGradient id={`sh-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <rect width={400} height={4} fill="#1d2430" />
      <rect y={3} width={400} height={57} fill={`url(#aw-${id})`} />
      <rect y={3} width={400} height={35} fill={`url(#sh-${id})`} />
    </svg>
  );
}

/** A drawn job board for projects without a live screenshot */
function BoardWindow() {
  return (
    <div className="flex h-full w-full flex-col bg-white" aria-hidden="true">
      <div className="flex h-[16%] min-h-3 items-center gap-[5%] bg-blue-900 px-[7%]">
        <span className="h-[34%] w-[22%] rounded-sm bg-white" />
        <span className="ml-auto h-[34%] w-[16%] rounded-sm bg-blue-400" />
      </div>
      <div className="flex flex-1 flex-col justify-evenly px-[7%]">
        {[0.72, 0.56, 0.64].map((w, i) => (
          <div key={i} className="flex items-center gap-[6%] border-b border-[#e3e3e3] pb-[4%]">
            <span className="h-1.5 rounded-full bg-ink-light" style={{ width: `${w * 100}%` }} />
            <span className={cn("ml-auto rounded-sm px-1.5 py-0.5 font-mono text-[8px] uppercase text-white", i === 0 ? "bg-blue-800" : "bg-ink-light")}>Bid</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** One project as a lit glass shopfront */
export function Shopfront({ project, index, active }: { project: ProjectData; index: number; active: boolean }) {
  const year = project.duration.match(/\d{4}/)?.[0] ?? (project.spotlight ? "Live" : "Personal");
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col rounded-2xl border bg-[linear-gradient(180deg,#151a22,#0d1016)] px-[6%] pb-[5%] pt-[5%] transition-[border-color,box-shadow] duration-500",
        active
          ? "border-blue-500 shadow-[0_0_0_1px_var(--blue-500),0_0_38px_-4px_rgba(10,132,255,0.65),inset_0_0_30px_-12px_rgba(10,132,255,0.6)]"
          : "border-white/10 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.9)]",
      )}
    >
      {/* Sign */}
      <div className="flex items-center gap-3 pb-[5%]">
        <span className="rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] tabular-nums text-white ring-1 ring-white/10">{String(index + 1).padStart(2, "0")}</span>
        <span className="display truncate text-[clamp(0.95rem,1.35vw,1.3rem)] text-white">{project.title}</span>
        {project.spotlight && (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue-800 px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-white">
            <span className="pulse-dot size-1 rounded-full bg-white" aria-hidden="true" />
            Live
          </span>
        )}
      </div>

      <Awning />

      {/* Window */}
      <div className="relative -mt-[2%] flex-1 overflow-hidden rounded-md border-[5px] border-[#1d2430] bg-white">
        {project.screenshot ? (
          <Image
            src={project.screenshot}
            alt={`${project.title} — live product screenshot`}
            fill
            sizes="(max-width: 768px) 70vw, 300px"
            className={cn("object-cover object-top transition-transform duration-700", active && "scale-[1.04]")}
          />
        ) : (
          <BoardWindow />
        )}
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.16)_45%,transparent_55%)]" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-[5%]">
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-white/80">
          {project.category} · {year}
        </span>
        <span className="ml-auto flex shrink-0 gap-2.5">
          {stackWithIcons(project.stack).map(({ name, Icon }) => (
            <Icon key={name} title={name} className="size-4 text-blue-300" />
          ))}
        </span>
      </div>
    </div>
  );
}

/** A street lantern with a cool glow */
export function Lamp() {
  return (
    <div className="relative flex h-[118%] w-7 shrink-0 flex-col items-center self-end" aria-hidden="true">
      <span className="lamp-glow absolute top-[2%] size-28 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,rgba(208,236,255,0.55),rgba(124,201,255,0.18)_40%,transparent_70%)]" />
      <span className="h-1.5 w-2 rounded-t-full bg-[#2a3140]" />
      <span className="h-0 w-0 border-x-[11px] border-b-[7px] border-x-transparent border-b-[#2a3140]" />
      <span className="relative h-6 w-[18px] border-x-[3px] border-[#2a3140] bg-blue-50 shadow-[0_0_18px_6px_rgba(208,236,255,0.55)]" />
      <span className="h-1.5 w-6 bg-[#2a3140]" />
      <span className="w-[5px] flex-1 bg-gradient-to-b from-[#2a3140] to-[#151a22]" />
      <span className="h-2.5 w-4 rounded-t-sm bg-[#2a3140]" />
    </div>
  );
}

/** Floating glass panels with a glowing code mark */
export function GlassPanels({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none [perspective:1100px]", className)} aria-hidden="true">
      <div className="float-y relative h-full w-full [animation-duration:7s] [transform-style:preserve-3d] [transform:rotateY(-24deg)_rotateX(8deg)]">
        {[
          { x: "58%", y: "-4%", z: -220, o: 0.35 },
          { x: "40%", y: "4%", z: -140, o: 0.5 },
          { x: "-6%", y: "26%", z: -110, o: 0.4 },
          { x: "-22%", y: "40%", z: -200, o: 0.3 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute inset-[12%] rounded-xl border border-blue-300/30 bg-blue-500/10 backdrop-blur-[2px]"
            style={{ transform: `translate3d(${p.x}, ${p.y}, ${p.z}px)`, opacity: p.o }}
          />
        ))}
        <span className="absolute inset-[12%] flex items-center justify-center rounded-xl border border-blue-300/70 bg-[linear-gradient(145deg,rgba(10,132,255,0.35),rgba(0,59,117,0.55))] shadow-[0_0_60px_-6px_rgba(10,132,255,0.8),inset_0_0_40px_rgba(124,201,255,0.25)]">
          <svg viewBox="0 0 64 40" className="w-[34%] drop-shadow-[0_0_10px_rgba(208,236,255,0.9)]" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8 6 20l12 12M46 8l12 12-12 12M37 4 27 36" />
          </svg>
        </span>
        {/* Data blocks rising off the front panel */}
        <span className="absolute bottom-[4%] left-[2%] flex items-end gap-1.5 [transform:translateZ(40px)]">
          {[28, 44, 34, 56, 40].map((h, i) => (
            <span key={i} className="w-3 rounded-sm border border-blue-300/50 bg-blue-500/25 shadow-[0_0_12px_rgba(10,132,255,0.6)]" style={{ height: h }} />
          ))}
        </span>
      </div>
    </div>
  );
}
