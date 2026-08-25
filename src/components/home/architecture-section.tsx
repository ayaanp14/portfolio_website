"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiBox, FiMaximize2 } from "react-icons/fi";

import { ArchitectureScene } from "@/scenes/architecture-scene";
import { SectionHeading } from "@/components/core/panel";

gsap.registerPlugin(ScrollTrigger);

/**
 * `// SYSTEM ARCHITECTURE` — a pinned, scroll-driven 3D scene: five stack
 * layers emerge and separate as the user scrolls through the section.
 */
export function ArchitectureSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Progress 0→1 spans exactly the pinned (sticky) window of the wrapper
    const st = ScrollTrigger.create({
      trigger: wrapper,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section id="system" aria-label="System architecture">
      <div ref={wrapperRef} className="relative h-[220vh]">
        <div className="sticky top-0 flex h-screen flex-col px-4 py-6 md:px-8">
          <div className="sys-panel sys-corners relative flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <SectionHeading title="SYSTEM ARCHITECTURE" icon={<FiBox size={14} />} />
              <span className="hidden font-mono text-[10px] tracking-[0.14em] text-dim md:block">
                SCROLL TO ASSEMBLE
              </span>
            </div>

            <ArchitectureScene progressRef={progressRef} className="min-h-0 flex-1" />

            <div className="flex items-center justify-between border-t border-line px-5 py-3">
              <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-signal">
                <span className="status-dot" />
                DATA FLOW ACTIVE
              </p>
              <a
                href="#projects"
                className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-muted transition-colors hover:text-signal sm:flex"
                data-cursor="INSPECT"
              >
                EXPLORE ARCHITECTURE
                <FiMaximize2 size={11} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
