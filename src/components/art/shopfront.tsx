import Image from "next/image";
import { useId } from "react";

import type { ProjectData } from "@/data/projects";
import { blue } from "@/styles/palette";
import { cn } from "@/lib/cn";

type Look = { facade: string; awning: string; door: string; text: string; sign: string };

/** Ink + blue colourways, cycled along the street */
export const SHOP_LOOKS: Look[] = [
  { facade: "#111111", awning: blue[800], door: blue[800], text: "#FFFFFF", sign: "#FFFFFF" },
  { facade: blue[800], awning: "#111111", door: "#111111", text: "#FFFFFF", sign: "#FFFFFF" },
  { facade: "#DCDCDC", awning: blue[800], door: "#111111", text: "#111111", sign: "#111111" },
  { facade: blue[950], awning: blue[400], door: blue[400], text: "#FFFFFF", sign: "#FFFFFF" },
];

function Awning({ color }: { color: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="block h-[16%] w-full" preserveAspectRatio="none" viewBox="0 0 400 66" aria-hidden="true">
      <defs>
        <pattern id={`aw-${id}`} width={64} height={66} patternUnits="userSpaceOnUse">
          <rect width={32} height={40} fill={color} />
          <rect x={32} width={32} height={40} fill="#FFFFFF" />
          <path d="M0 40 H32 V44 A16 16 0 0 1 0 44 Z" fill={color} />
          <path d="M32 40 H64 V44 A16 16 0 0 1 32 44 Z" fill="#FFFFFF" />
        </pattern>
      </defs>
      <rect width={400} height={66} fill={`url(#aw-${id})`} />
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
            <div className="flex flex-1 flex-col gap-1">
              <span className="h-1.5 rounded-full bg-ink-light" style={{ width: `${w * 100}%` }} />
              <span className="h-1 w-[40%] rounded-full bg-[#c9c9c9]" />
            </div>
            <span className="rounded-sm bg-blue-100 px-1.5 py-0.5 font-mono text-[8px] text-blue-900">₹</span>
            <span className={cn("rounded-sm px-1.5 py-0.5 font-mono text-[8px] uppercase text-white", i === 0 ? "bg-blue-800" : "bg-ink-light")}>Bid</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Shopfront({
  project,
  index,
  look,
  active,
}: {
  project: ProjectData;
  index: number;
  look: Look;
  active: boolean;
}) {
  return (
    <div data-tilt className="flex h-full w-full flex-col" style={{ backgroundColor: look.facade }}>
      {/* Upper floor */}
      <div className="relative h-[34%] px-[7%] pt-[6%]">
        <div className="flex justify-between">
          {[0, 1, 2].map((w) => (
            <span
              key={w}
              className={cn("block h-[44px] w-[24%] border-b-[6px] border-[#cfcfcf] transition-colors duration-500 max-md:h-8", active ? "bg-blue-100" : "bg-paper-3")}
            />
          ))}
        </div>
        {project.spotlight && (
          <span className="absolute right-[5%] top-[6%] inline-flex items-center gap-2 rounded-full bg-white py-1 pl-2 pr-3 font-mono text-[10px] uppercase tracking-[0.18em] text-blue-800 shadow-[0_6px_18px_-8px_rgba(0,0,0,0.5)] max-md:text-[8px]">
            <span className="pulse-dot size-1.5 rounded-full bg-blue-800" aria-hidden="true" />★ Personal · Live
          </span>
        )}
        <div className="absolute bottom-[10%] left-[5%] flex items-center gap-3">
          <span className="font-mono text-xs" style={{ color: look.text }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="display bg-white px-3 py-1 text-[clamp(1rem,1.9vw,1.6rem)] text-ink-light">{project.title}</span>
        </div>
      </div>

      <Awning color={look.awning} />

      {/* Shop floor */}
      <div className="relative flex flex-1 items-end gap-[6%] px-[6%] pb-[13%] pt-[4%]">
        <div className="relative h-full flex-1 overflow-hidden border-[6px] border-[#2b2b2b] bg-white">
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
          <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.22)_45%,transparent_55%)]" />
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.55)_48%,transparent_62%)] transition-transform duration-[1.1s] ease-out group-hover:translate-x-full" />
        </div>
        <div className="relative h-[72%] w-[15%] min-w-9" style={{ backgroundColor: look.door }}>
          <span className="absolute inset-x-[18%] top-[10%] h-[24%] bg-white/45" />
          <span className="absolute right-[16%] top-1/2 size-2 rounded-full bg-white" />
        </div>
        <p className="absolute bottom-[4%] left-[6%] font-mono text-[10px] uppercase tracking-[0.22em]" style={{ color: look.text }}>
          {project.category} · {project.duration.match(/\d{4}/)?.[0] ?? (project.spotlight ? "Personal · Live" : "Personal")}
        </p>
      </div>
    </div>
  );
}

/** Street lamp between shops */
export function Lamp() {
  return (
    <div className="relative flex h-[62%] w-6 shrink-0 flex-col items-center self-end" aria-hidden="true">
      <span className="h-0 w-0 border-x-[10px] border-b-[16px] border-x-transparent border-b-blue-800" />
      <span className="relative h-3 w-3 rounded-full bg-blue-300">
        <span className="lamp-glow absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,201,255,0.75),transparent_65%)]" />
      </span>
      <span className="w-[5px] flex-1 bg-ink" />
      <span className="h-3 w-5 bg-ink" />
    </div>
  );
}
