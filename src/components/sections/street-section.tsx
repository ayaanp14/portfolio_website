"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";

import { projectsData, type ProjectData } from "@/data/projects";
import { profile } from "@/data/profile";
import { useChapter } from "@/components/interactions/use-chapter";
import { ProjectExplorer } from "@/components/interactions/project-explorer";
import { Lamp, SHOP_LOOKS, Shopfront } from "@/components/art/shopfront";
import { Reveal, RevealHeading } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

const TOTAL = String(projectsData.length).padStart(2, "0");
const BACK_BLOCKS = [
  [6, 40], [9, 58], [7, 34], [12, 66], [8, 46], [10, 54], [6, 30], [11, 62], [9, 42], [7, 50], [12, 38], [8, 60], [10, 44], [9, 56],
];

/** A little delivery van that keeps driving down the road */
function Car() {
  return (
    <div className="drive absolute bottom-[calc(50%+4px)] left-0 h-[30px] w-[92px]">
      <span className="absolute bottom-[8px] left-0 h-[16px] w-full rounded-[5px] bg-blue-800" />
      <span className="absolute bottom-[22px] left-[34px] h-[12px] w-[44px] rounded-t-[6px] bg-blue-800">
        <span className="absolute right-[5px] top-[3px] h-[6px] w-[14px] rounded-sm bg-blue-100" />
      </span>
      <span className="absolute bottom-[14px] right-[-3px] size-[5px] rounded-full bg-blue-300 shadow-[0_0_10px_3px_rgba(124,201,255,0.7)]" />
      <span className="absolute bottom-0 left-[12px] size-[16px] rounded-full border-[4px] border-ink-light bg-paper-4" />
      <span className="absolute bottom-0 right-[12px] size-[16px] rounded-full border-[4px] border-ink-light bg-paper-4" />
    </div>
  );
}

export function StreetSection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<ProjectData | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useChapter(root, 1);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const q = gsap.utils.selector(el);
    const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth);
    // Shop centres within the track, measured once per refresh — not every frame
    let centres: number[] = [];
    const measure = () => {
      centres = Array.from(tr.querySelectorAll<HTMLElement>("[data-shop]"), (s) => s.offsetLeft + s.offsetWidth / 2);
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight * 0.3}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: 1,
          onRefresh: measure,
          onUpdate: () => {
            // The shop nearest the screen centre is "open"
            const mid = window.innerWidth / 2 - Number(gsap.getProperty(tr, "x"));
            let best = 0;
            let bestD = Infinity;
            centres.forEach((c, i) => {
              const d = Math.abs(c - mid);
              if (d < bestD) {
                bestD = d;
                best = i;
              }
            });
            setActive((cur) => (cur === best ? cur : best));
            if (counter.current) counter.current.textContent = String(best + 1).padStart(2, "0");
          },
        },
      });
      tl.to(tr, { x: () => -distance(), duration: 1 }, 0)
        .to(q("[data-parallax-back]"), { x: () => -distance() * 0.35, duration: 1 }, 0)
        .to(q("[data-parallax-sky]"), { x: () => -distance() * 0.1, duration: 1 }, 0)
        .to({}, { duration: 0.15 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        id="street"
        ref={root}
        data-tone-left="light"
        data-tone-right="light"
        aria-label="02 — The Street: projects"
        className="side-front relative h-[100svh] min-h-[600px] overflow-hidden"
      >
        {/* Sky */}
        <div data-parallax-sky className="pointer-events-none absolute inset-0" aria-hidden="true">
          <span className="absolute right-[3vw] top-[13vh] size-[clamp(3.5rem,6vw,5.5rem)] rounded-full bg-blue-800">
            <span className="ping-ring absolute inset-0 rounded-full border-2 border-blue-300 [animation-duration:4s]" />
          </span>
          <span className="cloud absolute left-[3vw] top-[30vh] h-5 w-48 rounded-full bg-paper-3">
            <span className="absolute -top-5 left-10 h-10 w-20 rounded-full bg-paper-3" />
          </span>
          <span className="cloud absolute left-[62vw] top-[10vh] h-4 w-32 rounded-full bg-paper-2 [animation-delay:-6s]" />
        </div>

        {/* Heading */}
        <div className="relative z-10 px-6 pt-[11vh] text-center">
          <Reveal y={12}>
            <p className="eyebrow">
              <b>02</b>The Street
            </p>
          </Reveal>
          <RevealHeading lines={[["The front is"], ["what", { text: "people see.", em: true }]]} className="mt-4 text-[clamp(1.9rem,4.6vw,4.1rem)]" />
          <Reveal y={12} delay={0.3}>
            <p className="label mt-5 inline-flex items-center gap-3">
              <span className="h-px w-10 bg-accent" /> Scroll sideways <FiArrowRight aria-hidden="true" className="drift-x text-accent" />
            </p>
          </Reveal>
        </div>

        {/* Back buildings */}
        <div data-parallax-back className="pointer-events-none absolute bottom-[11vh] left-0 flex items-end gap-3" aria-hidden="true">
          {[...BACK_BLOCKS, ...BACK_BLOCKS].map(([w, h], i) => (
            <span key={i} className="block bg-paper-2" style={{ width: `${w}vw`, height: `${h * 0.55}vh` }}>
              <span className="mx-[18%] mt-[14%] block h-[30%] bg-[repeating-linear-gradient(90deg,#e4e4e4_0_10px,transparent_10px_22px)]" />
            </span>
          ))}
        </div>

        {/* The shops */}
        <div
          ref={track}
          className="absolute bottom-[11vh] left-0 z-10 flex h-[clamp(300px,47vh,460px)] items-end gap-[clamp(1.5rem,4vw,4rem)] pl-[4vw] pr-[30vw] will-change-transform"
        >
          {projectsData.map((p, i) => (
            <Fragment key={p.id}>
              {i > 0 && <Lamp />}
              <button
                type="button"
                data-shop
                data-cursor="View"
                onClick={() => setOpen(p)}
                className={cn(
                  "group relative h-full w-[clamp(260px,29vw,420px)] shrink-0 text-left transition-transform duration-500 max-md:w-[78vw]",
                  active === i ? "-translate-y-2" : "translate-y-0",
                )}
                aria-label={`${p.title} — ${p.tagline}. Open project details`}
              >
                <Shopfront project={p} index={i} look={SHOP_LOOKS[i % SHOP_LOOKS.length]} active={active === i} />
                <span className="pill pill-accent absolute -top-5 right-4 !h-9 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  Explore <FiArrowRight aria-hidden="true" />
                </span>
              </button>
            </Fragment>
          ))}
          <Lamp />
          <div className="flex h-full w-[clamp(240px,24vw,340px)] shrink-0 flex-col justify-center">
            <p className="label">End of the street</p>
            <p className="display mt-3 text-[clamp(1.5rem,2.4vw,2.2rem)]">
              {TOTAL} products
              <br />
              <span className="hl">shipped.</span>
            </p>
            <a href={profile.links.github} target="_blank" rel="noreferrer" className="pill pill-outline mt-6 self-start">
              All on GitHub <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Road */}
        <div className="absolute inset-x-0 bottom-0 z-10 h-[11vh] border-t-[3px] border-ink-light bg-paper-3" aria-hidden="true">
          <div className="absolute inset-x-0 top-1/2 h-[3px] bg-[repeating-linear-gradient(90deg,#ffffff_0_32px,transparent_32px_92px)]" />
          <Car />
        </div>

        {/* HUD */}
        <p className="absolute bottom-[3.5vh] left-[4vw] z-20 font-mono text-[11px] uppercase tracking-[0.2em] text-ink">
          <span ref={counter} className="text-accent">
            01
          </span>{" "}
          / {TOTAL} shipped
        </p>
      </section>

      <ProjectExplorer project={open} onClose={close} />
    </>
  );
}
