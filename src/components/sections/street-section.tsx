"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiExternalLink, FiGithub, FiLayers } from "react-icons/fi";

import { projectsData, type ProjectData } from "@/data/projects";
import { profile } from "@/data/profile";
import { skillsData } from "@/data/skills";
import { useChapter } from "@/components/interactions/use-chapter";
import { ProjectExplorer } from "@/components/interactions/project-explorer";
import { GlassPanels, Lamp, Shopfront } from "@/components/art/shopfront";
import { scrollToHash } from "@/components/navigation/navbar";
import { getLenis } from "@/lib/lenis-store";
import { useSite } from "@/lib/site-store";
import { stackWithIcons } from "@/lib/tech-icons";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

const N = projectsData.length;
const pad = (n: number) => String(n).padStart(2, "0");
const LIVE = projectsData.filter((p) => p.links.live).length;
const STACK = ["react", "nodejs", "java", "mongodb", "mysql", "azure", "railway"]
  .map((id) => skillsData.find((s) => s.id === id))
  .filter((s) => s !== undefined);

/** Little delivery van that marks progress along the road */
function Car() {
  return (
    <span className="relative block h-[22px] w-[64px]" aria-hidden="true">
      <span className="absolute bottom-[6px] left-0 h-[11px] w-full rounded-[4px] bg-blue-500" />
      <span className="absolute bottom-[16px] left-[22px] h-[9px] w-[32px] rounded-t-[5px] bg-blue-500">
        <span className="absolute right-[4px] top-[2px] h-[5px] w-[10px] rounded-sm bg-blue-100" />
      </span>
      <span className="absolute bottom-[10px] right-[-3px] size-[4px] rounded-full bg-blue-100 shadow-[0_0_10px_3px_rgba(124,201,255,0.8)]" />
      <span className="absolute bottom-0 left-[8px] size-[12px] rounded-full border-[3px] border-[#0d1016] bg-blue-100" />
      <span className="absolute bottom-0 right-[8px] size-[12px] rounded-full border-[3px] border-[#0d1016] bg-blue-100" />
    </span>
  );
}

const roundBtn =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/[0.04] text-white backdrop-blur transition-colors hover:border-blue-400 hover:bg-blue-800 disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:bg-white/[0.04]";

export function StreetSection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const car = useRef<HTMLSpanElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<ProjectData | null>(null);
  const close = useCallback(() => setOpen(null), []);
  useChapter(root, 1);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    // Distance between neighbouring shops (shop + lamp + gaps)
    const step = () => {
      const shops = tr.querySelectorAll<HTMLElement>("[data-shop]");
      return shops.length > 1 ? shops[1].offsetLeft - shops[0].offsetLeft : 0;
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${window.innerHeight * 0.75 * (N - 1)}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          refreshPriority: 1,
          // The pin keeps the section on screen, so mark the chapter from here
          onToggle: (self) => {
            if (self.isActive) useSite.getState().setChapter(1);
          },
          onUpdate: (self) => {
            const i = Math.round(self.progress * (N - 1));
            setActive((cur) => (cur === i ? cur : i));
          },
        },
      });
      stRef.current = tl.scrollTrigger ?? null;
      tl.to(tr, { x: () => -step() * (N - 1), duration: 1 }, 0).to(car.current, { left: "100%", xPercent: -100, duration: 1 }, 0);
    }, el);

    // Re-measure whenever the row of shops changes size (fonts, images, a new project)
    let width = tr.offsetWidth;
    const ro = new ResizeObserver(() => {
      if (tr.offsetWidth === width) return;
      width = tr.offsetWidth;
      ScrollTrigger.refresh();
    });
    ro.observe(tr);
    return () => {
      ro.disconnect();
      ctx.revert();
    };
  }, []);

  /** Scrolls the pinned street to shop `i` */
  const goTo = useCallback((i: number) => {
    const to = Math.max(0, Math.min(N - 1, i));
    const st = stRef.current;
    if (!st) return setActive(to);
    const y = st.start + (to / Math.max(1, N - 1)) * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  const p = projectsData[active];
  const stats = p.metrics.slice(0, 3);
  const link = p.links.live ?? p.links.github;

  return (
    <>
      <section
        id="street"
        ref={root}
        data-tone-left="night"
        data-tone-right="night"
        aria-label="02 — The Street: projects"
        className="tone-dark relative flex h-[100svh] min-h-[700px] flex-col overflow-hidden bg-[#080b10] text-white"
      >
        {/* Backdrop: grid + blue glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(124,201,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(124,201,255,0.05)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_60%_30%,#000_20%,transparent_75%)]" />
          <div className="absolute -top-[20%] right-[8%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(0,102,204,0.35),transparent)]" />
          <div className="absolute bottom-[18%] left-[10%] h-[40%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(0,59,117,0.45),transparent)]" />
        </div>

        {/* Top: intro + glass panels */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] items-start justify-between px-[6vw] pt-[max(5.5rem,11vh)]">
          <div className="max-w-[640px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
              Full-stack developer <span className="px-1.5 text-white/50">×</span> <span className="text-blue-400">Product builder</span>
            </p>
            <h2 className="display mt-4 text-[clamp(1.8rem,3.1vw,3.2rem)] leading-[0.95] text-white max-sm:text-[6.6vw]">
              <span className="block whitespace-nowrap">The front is</span>
              <span className="block whitespace-nowrap">
                what <span className="text-blue-400">people see.</span>
              </span>
            </h2>
            <p className="mt-4 max-w-md font-mono text-[13px] leading-relaxed text-white/75">I build products, platforms and experiences that solve real problems.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setOpen(p)}
                className="inline-flex h-11 items-center gap-2.5 rounded-full bg-white px-6 text-[13px] font-medium text-[#111] transition-colors hover:bg-blue-100"
              >
                Explore my work <FiArrowUpRight aria-hidden="true" />
              </button>
              <a
                href={profile.links.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2.5 rounded-full border border-white/30 pl-1.5 pr-5 text-[13px] text-white transition-colors hover:border-blue-400"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-white/40">
                  <FiGithub aria-hidden="true" />
                </span>
                All on GitHub
              </a>
            </div>
          </div>
          <GlassPanels className="-mt-[2vh] mr-[2vw] hidden h-[clamp(150px,23vh,240px)] w-[clamp(220px,24vw,360px)] lg:block" />
        </div>

        {/* Middle: the street + selected project */}
        <div className="relative z-10 mx-auto mt-auto flex w-full max-w-[1500px] items-end gap-5 px-[3vw]">
          <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} className={cn(roundBtn, "mb-[11vh] max-md:hidden")} aria-label="Previous project">
            <FiArrowLeft aria-hidden="true" />
          </button>

          <div className="relative min-w-0 flex-1 overflow-x-clip pt-8">
            <div
              ref={track}
              className="relative flex h-[clamp(200px,27vh,285px)] w-max items-end gap-[clamp(1rem,2.4vw,2.5rem)] pl-[clamp(1rem,2vw,2rem)] pr-[40vw] will-change-transform"
            >
              <Lamp />
              {projectsData.map((proj, i) => (
                <Fragment key={proj.id}>
                  <button
                    type="button"
                    data-shop
                    data-cursor="View"
                    onClick={() => (i === active ? setOpen(proj) : goTo(i))}
                    className={cn(
                      "group relative h-full w-[clamp(250px,21vw,320px)] shrink-0 text-left transition-[transform,opacity] duration-500 max-md:w-[72vw]",
                      i === active ? "-translate-y-1.5" : "opacity-80 hover:opacity-100",
                    )}
                    aria-label={`${proj.title} — ${proj.tagline}. ${i === active ? "Open project details" : "Show this project"}`}
                    aria-current={i === active ? "true" : undefined}
                  >
                    <Shopfront project={proj} index={i} active={i === active} />
                  </button>
                  <Lamp />
                </Fragment>
              ))}
            </div>
            {/* Glowing kerb */}
            <span className="block h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" aria-hidden="true" />
            <span className="mx-auto block h-6 w-[80%] bg-[radial-gradient(ellipse_at_top,rgba(10,132,255,0.25),transparent_70%)]" aria-hidden="true" />
          </div>

          {/* Selected project: holds its column, but rises above the row into the open space */}
          <div className="hidden w-[clamp(260px,22vw,330px)] shrink-0 lg:block" aria-hidden="true" />
          <aside
            aria-live="polite"
            className="absolute bottom-[3vh] right-[calc(3vw+2.75rem+1.25rem)] hidden w-[clamp(260px,22vw,330px)] rounded-2xl border border-white/15 bg-white/[0.05] p-5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-md lg:block"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
              Selected project / <span className="text-blue-400">{pad(active + 1)}</span>
            </p>
            <h3 key={p.id} className="display mt-3 text-[clamp(1.4rem,2vw,2rem)] text-white">
              {p.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-white/75">{p.tagline}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {stackWithIcons(p.stack).map(({ name, Icon }) => (
                <li key={name} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white">
                  <Icon aria-hidden="true" className="size-3.5 text-blue-300" />
                  {name}
                </li>
              ))}
            </ul>
            {stats.length > 0 && (
              <dl className="mt-5 grid grid-cols-3 divide-x divide-white/15 border-y border-white/15 py-3">
                {stats.map((m) => (
                  <div key={m.label} className="flex flex-col-reverse px-2 first:pl-0">
                    <dt className="mt-1 text-[9.5px] leading-tight text-white/60">{m.label}</dt>
                    <dd className="font-mono text-[15px] font-semibold text-white">
                      {m.value.toLocaleString("en-IN")}
                      {m.suffix ?? ""}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-5 flex gap-2.5">
              <button
                type="button"
                onClick={() => setOpen(p)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-white text-[13px] font-medium text-[#111] transition-colors hover:bg-blue-100"
              >
                View case study <FiArrowUpRight aria-hidden="true" />
              </button>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex size-10 items-center justify-center rounded-lg border border-white/20 text-white transition-colors hover:border-blue-400"
                  aria-label={`Open ${p.title}${p.links.live ? "" : " on GitHub"}`}
                >
                  <FiExternalLink aria-hidden="true" />
                </a>
              )}
            </div>
          </aside>

          <button type="button" onClick={() => goTo(active + 1)} disabled={active === N - 1} className={cn(roundBtn, "mb-[11vh] max-md:hidden")} aria-label="Next project">
            <FiArrowRight aria-hidden="true" />
          </button>
        </div>

        {/* Road: progress */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] items-center gap-6 px-[6vw] pb-3 pt-2">
          <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
            <span className="text-blue-400">{pad(active + 1)}</span> / {pad(N)} projects
          </p>
          <div className="relative h-6 flex-1">
            <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.25)_0_28px,transparent_28px_52px)]" aria-hidden="true" />
            <span ref={car} className="absolute left-0 top-1/2 -translate-y-[60%]">
              <Car />
            </span>
          </div>
          <div className="flex shrink-0 gap-3">
            <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} className={cn(roundBtn, "size-10")} aria-label="Previous project">
              <FiArrowLeft aria-hidden="true" />
            </button>
            <button type="button" onClick={() => goTo(active + 1)} disabled={active === N - 1} className={cn(roundBtn, "size-10")} aria-label="Next project">
              <FiArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Footer strip: totals + stack */}
        <div className="relative z-10 border-t border-white/10">
          <div className="mx-auto flex w-full max-w-[1500px] items-center gap-[clamp(1rem,3vw,3rem)] px-[6vw] py-[clamp(0.8rem,2vh,1.25rem)]">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-800/30 text-blue-300 max-md:hidden">
              <FiLayers aria-hidden="true" />
            </span>
            {[
              [pad(N), "Projects"],
              ["3+", "Years building"],
              [pad(LIVE), "Live products"],
            ].map(([v, l], i) => (
              <div key={l} className={cn("shrink-0", i > 0 && "border-l border-white/15 pl-[clamp(1rem,3vw,3rem)]")}>
                <p className="display text-[clamp(1.1rem,1.6vw,1.5rem)] text-white">{v}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">{l}</p>
              </div>
            ))}
            <div className="ml-auto hidden items-center gap-3 xl:flex">
              <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">Tech stack</span>
              {STACK.map((s) => (
                <span key={s.id} title={s.name} className="inline-flex size-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <s.icon aria-label={s.name} className="size-5 text-blue-300" />
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => scrollToHash("#hood")}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/25 px-5 text-[13px] text-white transition-colors hover:border-blue-400 max-xl:ml-auto max-sm:hidden"
            >
              View all skills <FiArrowUpRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <ProjectExplorer project={open} onClose={close} />
    </>
  );
}
