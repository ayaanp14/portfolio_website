import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SysPanelProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/** Dark technical glass panel with `// TITLE` header row and corner ticks. */
export function SysPanel({ title, children, className, bodyClassName }: SysPanelProps) {
  return (
    <div className={cn("sys-panel sys-corners", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <p className="sys-label">{`// ${title}`}</p>
          <span aria-hidden="true" className="font-mono text-[10px] text-dim">
            ×
          </span>
        </div>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </div>
  );
}

type SectionHeadingProps = {
  title: string;
  icon?: ReactNode;
  className?: string;
};

/** `// SECTION TITLE` header used at the top of each system section. */
export function SectionHeading({ title, icon, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {icon && (
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center border border-line text-signal"
        >
          {icon}
        </span>
      )}
      <h2 className="sys-label text-[12px]">{`// ${title}`}</h2>
    </div>
  );
}
