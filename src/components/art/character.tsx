import { useId } from "react";

import { blue, ink } from "@/styles/palette";

/**
 * Ayaan — a developer drawn twice over the same silhouette.
 *   FRONT (left of `split`): the finished, flat-colour build.
 *   BACK  (right of `split`): the blueprint — outlines, hatching, a ruler.
 * Blueprint strokes carry `data-bp` (pathLength 1) so scenes can draw them in.
 */

const W = 400;
const H = 520;

const shapes = {
  torso: "M34 520 C 44 428, 98 378, 200 366 C 302 378, 356 428, 366 520 Z",
  neck: "M168 316 L232 316 L236 372 Q200 388 164 372 Z",
  hair: "M110 228 C 100 128, 168 98, 206 102 C 282 104, 312 164, 292 230 C 284 192, 252 166, 202 166 C 158 166, 124 186, 110 228 Z",
  band: "M96 232 C 88 92, 312 92, 304 232",
  collar: "M146 372 Q200 404 254 372",
  mic: "M96 268 C 104 300, 132 312, 162 306",
  sleeveL: "M84 446 C 96 470, 104 494, 106 520",
  sleeveR: "M316 446 C 304 470, 296 494, 294 520",
};

function Glasses({ fill, stroke, strokeWidth, bp }: { fill: string; stroke?: string; strokeWidth?: number; bp?: boolean }) {
  const common = { fill, stroke, strokeWidth, ...(bp ? { pathLength: 1, "data-bp": "" } : {}) };
  return (
    <>
      <rect x={136} y={216} width={54} height={30} rx={9} {...common} />
      <rect x={210} y={216} width={54} height={30} rx={9} {...common} />
      <path d="M190 228 L210 228" fill="none" stroke={stroke ?? fill} strokeWidth={strokeWidth ?? 5} {...(bp ? { pathLength: 1, "data-bp": "" } : {})} />
    </>
  );
}

export function Character({
  split = W / 2,
  className,
  showRuler = true,
}: {
  /** x in viewBox units (0–400) where the build turns into blueprint */
  split?: number;
  className?: string;
  showRuler?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const front = `front-${uid}`;
  const back = `back-${uid}`;
  const hatch = `hatch-${uid}`;
  const s = Math.min(Math.max(split, 0), W);

  const bpStroke = { fill: "none", stroke: blue[400], strokeWidth: 2.5, strokeLinejoin: "round" as const, pathLength: 1, "data-bp": "" };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label="Illustration of Ayaan: half finished build, half blueprint">
      <defs>
        <clipPath id={front}>
          <rect x={0} y={0} width={s} height={H} />
        </clipPath>
        <clipPath id={back}>
          <rect x={s} y={0} width={W - s} height={H} />
        </clipPath>
        <pattern id={hatch} width={W} height={10} patternUnits="userSpaceOnUse">
          <line x1={0} y1={0.5} x2={W} y2={0.5} stroke={blue[400]} strokeOpacity={0.5} strokeWidth={1.2} />
        </pattern>
      </defs>

      {/* FRONT — finished build */}
      <g clipPath={`url(#${front})`}>
        <path d={shapes.torso} fill={blue[800]} />
        <path d="M34 520 C 44 440, 84 394, 132 378 L 146 520 Z" fill={blue[900]} />
        <path d={shapes.sleeveL} fill="none" stroke={blue[950]} strokeWidth={4} />
        <path d={shapes.sleeveR} fill="none" stroke={blue[950]} strokeWidth={4} />
        <path d={shapes.neck} fill={ink.light.primary} />
        <path d={shapes.collar} fill="none" stroke={blue[950]} strokeWidth={10} strokeLinecap="round" />
        <ellipse cx={200} cy={232} rx={86} ry={98} fill={ink.light.primary} />
        <path d={shapes.hair} fill={blue[400]} />
        <path d={shapes.band} fill="none" stroke={ink.light.primary} strokeWidth={14} strokeLinecap="round" />
        <rect x={78} y={198} width={34} height={76} rx={14} fill={blue[800]} stroke={ink.light.primary} strokeWidth={5} />
        <rect x={288} y={198} width={34} height={76} rx={14} fill={blue[800]} stroke={ink.light.primary} strokeWidth={5} />
        <path d={shapes.mic} fill="none" stroke={ink.light.primary} strokeWidth={5} strokeLinecap="round" />
        <circle cx={165} cy={305} r={7} fill={blue[400]} />
        <Glasses fill="#FFFFFF" />
        <text x={200} y={470} textAnchor="middle" fontFamily="var(--font-jetbrains), monospace" fontWeight={700} fontSize={44} fill="#FFFFFF">
          {"</>"}
        </text>
      </g>

      {/* BACK — blueprint */}
      <g clipPath={`url(#${back})`}>
        <path d={shapes.torso} fill={ink.dark.background} />
        <path d={shapes.torso} fill={`url(#${hatch})`} data-bp-fill="" />
        <path d={shapes.torso} {...bpStroke} />
        <path d={shapes.sleeveL} {...bpStroke} />
        <path d={shapes.sleeveR} {...bpStroke} />
        <path d={shapes.neck} fill={ink.dark.background} />
        <path d={shapes.neck} {...bpStroke} />
        <path d={shapes.collar} {...bpStroke} />
        <ellipse cx={200} cy={232} rx={86} ry={98} fill={ink.dark.background} />
        <ellipse cx={200} cy={232} rx={86} ry={98} {...bpStroke} />
        <path d={shapes.hair} fill={`url(#${hatch})`} data-bp-fill="" />
        <path d={shapes.hair} {...bpStroke} />
        <path d={shapes.band} {...bpStroke} strokeWidth={3} />
        <rect x={78} y={198} width={34} height={76} rx={14} {...bpStroke} />
        <rect x={288} y={198} width={34} height={76} rx={14} {...bpStroke} />
        <path d={shapes.mic} {...bpStroke} />
        <circle cx={165} cy={305} r={7} {...bpStroke} />
        <Glasses fill="none" stroke={blue[400]} strokeWidth={2.5} bp />
        <text
          x={200}
          y={470}
          textAnchor="middle"
          fontFamily="var(--font-jetbrains), monospace"
          fontWeight={700}
          fontSize={44}
          fill="none"
          stroke={blue[400]}
          strokeWidth={1.4}
        >
          {"</>"}
        </text>
        {showRuler &&
          Array.from({ length: 18 }, (_, i) => (
            <line key={i} x1={s} x2={s + (i % 4 === 0 ? 30 : 18)} y1={96 + i * 24} y2={96 + i * 24} stroke={blue[400]} strokeOpacity={0.7} strokeWidth={1.4} />
          ))}
      </g>

      {/* The seam */}
      <line x1={s} x2={s} y1={80} y2={H} stroke={blue[300]} strokeOpacity={0.8} strokeWidth={1.4} strokeDasharray="4 5" />
    </svg>
  );
}
