import { blue } from "@/styles/palette";

/** Split square: the finished build on the left, its blueprint on the right. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x={2} y={2} width={14} height={28} rx={3} fill={blue[800]} />
      <path d="M16 2 H27 a3 3 0 0 1 3 3 V27 a3 3 0 0 1 -3 3 H16" fill="none" stroke={blue[400]} strokeWidth={2} />
      <path d="M16 9 H26 M16 14 H26 M16 19 H26 M16 24 H26" stroke={blue[400]} strokeWidth={1} strokeOpacity={0.7} />
    </svg>
  );
}
