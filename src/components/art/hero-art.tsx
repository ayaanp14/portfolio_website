import { forwardRef, type ReactNode } from "react";
import { FiMousePointer, FiPenTool } from "react-icons/fi";
import { SiMongodb, SiNodedotjs } from "react-icons/si";

/**
 * Opening-scene illustrations, drawn on a 720×900 artboard that the hero
 * scales to fit each half of the screen. Pure DOM + SVG, no images.
 *
 * Animation layers never share a transform:
 *   [data-depth] — pointer parallax (hero)
 *   [data-pop]   — intro entrance (hero)
 *   inner nodes  — ambient CSS loops (globals.css)
 */

function Layer({ depth, children }: { depth: number; children: ReactNode }) {
  return (
    <div data-depth={depth} className="pointer-events-none absolute inset-0">
      {children}
    </div>
  );
}

/** FRONT — the product people see */
export function FrontArtboard() {
  return (
    <div className="relative h-[900px] w-[720px]" aria-hidden="true">
      {/* Browser */}
      <Layer depth={0.5}>
        <div data-pop className="absolute left-[50px] top-[300px] h-[330px] w-[520px] overflow-hidden rounded-xl bg-paper-2 shadow-[0_1px_0_#dcdcdc]">
          <div className="flex h-10 items-center gap-2 bg-blue-800 px-4">
            <span className="size-3 rounded-full bg-white" />
            <span className="size-3 rounded-full bg-white" />
            <span className="size-3 rounded-full bg-white" />
          </div>
          <div className="relative px-9 pt-10">
            <div className="type-bar h-7 w-[250px] bg-ink-light" />
            <div className="shimmer mt-5 h-2.5 w-[300px] bg-paper-4" />
            <div className="shimmer mt-3 h-2.5 w-[250px] bg-paper-4 [animation-delay:.15s]" />
            <div className="shimmer mt-3 h-2.5 w-[280px] bg-paper-4 [animation-delay:.3s]" />
            <div className="cta-press relative mt-8 h-[46px] w-[150px] rounded-full bg-blue-800">
              <span className="cta-ripple absolute inset-0 rounded-full border-2 border-blue-400" />
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="swatch-pop size-[26px] bg-blue-800" />
              <span className="swatch-pop size-[26px] bg-ink-light [animation-delay:1s]" />
              <span className="swatch-pop size-[26px] bg-blue-300 [animation-delay:2s]" />
              <span className="swatch-pop size-[26px] bg-paper-4 [animation-delay:3s]" />
              <FiPenTool className="ml-3 size-6 text-ink-light" />
            </div>
            <div className="absolute right-9 top-10 h-[100px] w-[124px] overflow-hidden bg-paper-4">
              <span className="float-y absolute right-4 top-4 size-6 rounded-full bg-blue-800 [animation-duration:3.5s]" />
              <svg viewBox="0 0 124 100" className="absolute inset-0">
                <path d="M0 100 L46 48 L78 84 L94 66 L124 100 Z" fill="#111111" />
              </svg>
            </div>
            <FiMousePointer className="cursor-path absolute left-[176px] top-[196px] size-10 fill-ink-light text-ink-light" />
          </div>
        </div>
      </Layer>

      {/* Type specimen */}
      <Layer depth={1}>
        <div data-pop className="absolute left-[50px] top-[672px] flex h-[130px] w-[150px] items-center justify-center rounded-xl bg-paper-3">
          <span className="relative text-[64px] text-ink-light">
            <span className="display weight-heavy block normal-case">Aa</span>
            <span className="display weight-light absolute inset-0 text-center normal-case !font-extralight opacity-0">Aa</span>
          </span>
        </div>
      </Layer>

      {/* Toggle */}
      <Layer depth={1.2}>
        <div data-pop className="toggle-track absolute left-[226px] top-[708px] h-[50px] w-[100px] rounded-full bg-blue-800">
          <span className="toggle-knob absolute right-[7px] top-[7px] size-9 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)]" />
        </div>
      </Layer>

      {/* Phone */}
      <Layer depth={1.6}>
        <div data-pop className="absolute left-[480px] top-[520px]">
          <div className="float-y h-[290px] w-[150px] overflow-hidden rounded-[26px] border-[10px] border-ink-light bg-white [animation-duration:6s]">
            <div className="h-11 bg-blue-800" />
            <div className="shimmer mx-3 mt-4 h-14 rounded-md bg-paper-3" />
            <div className="shimmer mx-3 mt-3 h-14 rounded-md bg-paper-3 [animation-delay:.2s]" />
            <div className="shimmer mx-3 mt-4 h-2.5 w-16 bg-paper-4 [animation-delay:.4s]" />
          </div>
        </div>
      </Layer>
    </div>
  );
}

export const TERMINAL_LINES = [
  { text: "$ npm run build", tone: "cmd" },
  { text: "✓ compiled successfully", tone: "out" },
  { text: "$ curl /api/health", tone: "cmd" },
  { text: "HTTP/1.1 200 OK", tone: "out" },
  { text: "$ git push origin main", tone: "cmd" },
] as const;

const STARS = [
  [90, 80],
  [520, 70],
  [620, 120],
  [330, 230],
  [690, 190],
  [160, 250],
  [410, 40],
];

const CABLES = ["M290 630 C 290 660, 220 660, 210 692", "M630 630 C 630 670, 580 660, 556 684"];

/** BACK — the system that makes it run. Terminal lines are typed by the hero. */
export const BackArtboard = forwardRef<HTMLDivElement>(function BackArtboard(_, ref) {
  return (
    <div className="relative h-[900px] w-[720px]" aria-hidden="true">
      {/* Stars */}
      <Layer depth={0.25}>
        {STARS.map(([x, y], i) => (
          <span
            key={`${x}-${y}`}
            className="twinkle absolute size-[3px] rounded-full bg-paper-4"
            style={{ left: x, top: y, animationDelay: `${-i * 0.7}s`, animationDuration: `${2.6 + (i % 3)}s` }}
          />
        ))}
      </Layer>

      {/* Cables — base line drawn in, packets flow along */}
      <Layer depth={0.8}>
        <svg viewBox="0 0 720 900" className="absolute inset-0 h-full w-full">
          {CABLES.map((d, i) => (
            <g key={d}>
              <path data-draw d={d} pathLength={1} fill="none" stroke="#3aa9ff" strokeOpacity={0.75} strokeWidth={2} />
              <path
                d={d}
                pathLength={100}
                fill="none"
                stroke="#b9e3ff"
                strokeWidth={4}
                strokeLinecap="round"
                className="flow"
                style={{ animationDelay: `${-i * 0.9}s` }}
              />
            </g>
          ))}
        </svg>
      </Layer>

      {/* Terminal */}
      <Layer depth={0.5}>
        <div data-pop className="absolute left-[150px] top-[300px] h-[330px] w-[520px] overflow-hidden rounded-xl bg-night-3">
          <div className="flex h-10 items-center gap-2 bg-night-4 px-4">
            <span className="size-3 rounded-full bg-[#5a5a5a]" />
            <span className="size-3 rounded-full bg-[#5a5a5a]" />
            <span className="size-3 rounded-full bg-[#5a5a5a]" />
          </div>
          <div ref={ref} className="space-y-1.5 px-7 pt-8 font-mono text-[19px] leading-[1.6]">
            {TERMINAL_LINES.map((line, i) => (
              <p key={i} data-line={line.text} className={line.tone === "out" ? "text-blue-400" : "text-ink-dark"} />
            ))}
            <span className="blink mt-1 inline-block h-6 w-3 bg-blue-400" />
          </div>
        </div>
      </Layer>

      {/* Server rack */}
      <Layer depth={1.1}>
        <div data-pop className="absolute left-[110px] top-[690px] w-[190px] space-y-2.5 bg-night-3 p-3">
          {[0, 1, 2, 3].map((r) => (
            <div key={r} className="flex h-7 items-center gap-1.5 bg-night-4 px-3">
              <span
                className={r === 2 ? "led size-2 rounded-full bg-blue-300" : "led size-2 rounded-full bg-blue-400"}
                style={{ animationDelay: `${-r * 0.55}s`, animationDuration: `${1.6 + r * 0.45}s` }}
              />
              <span className="size-2 rounded-full bg-[#4a4a4a]" />
              {r === 0 && <SiNodedotjs className="ml-auto size-5 text-blue-400" />}
            </div>
          ))}
        </div>
      </Layer>

      {/* Database */}
      <Layer depth={1.4}>
        <div data-pop className="absolute left-[440px] top-[680px] h-[170px] w-[160px]">
          <div className="absolute inset-x-0 bottom-0 top-5 rounded-b-[50%_20px] bg-night-3" />
          <div className="absolute inset-x-0 top-0 h-10 rounded-[50%] bg-night-4" />
          <span className="ping-ring absolute inset-x-0 top-0 h-10 rounded-[50%] border-2 border-blue-400/70 [animation-duration:3s]" />
          <div className="absolute inset-x-0 top-[60px] h-10 rounded-[50%] border-b-2 border-[#2a2a2a]" />
          <div className="absolute inset-x-0 top-[100px] h-10 rounded-[50%] border-b-2 border-[#2a2a2a]" />
          <SiMongodb className="float-y absolute left-[64px] top-[96px] size-8 text-blue-400 drop-shadow-[0_0_10px_rgba(58,169,255,0.6)] [animation-duration:3s]" />
        </div>
      </Layer>
    </div>
  );
});
