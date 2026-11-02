"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";
import type { IconType } from "react-icons";
import { FiArrowRight, FiArrowUpRight, FiCloud, FiDatabase, FiGithub, FiMonitor, FiServer, FiSettings, FiShare2 } from "react-icons/fi";

import { factoryModules, type FactoryModule, type FactoryModuleKind } from "@/data/factory";
import { profile } from "@/data/profile";
import { useChapter } from "@/components/interactions/use-chapter";
import { getLenis, onLenis } from "@/lib/lenis-store";
import { prefersReducedMotion } from "@/lib/quality";
import { Reveal, RevealHeading } from "@/components/ui/reveal";
import { BrandMark } from "@/components/navigation/brand";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

/*
 * THE FACTORY — a wheel-driven strip.
 *
 * On desktop the page scrolls normally until the factory reaches the top of
 * the viewport, then locks: the wheel drives the belt instead (0.45px of belt
 * per px of wheel), with the wall, machines and foreground pillars moving at
 * 0.3×, 0.6× and 1.5× of it. When the last crate is through, the page unlocks
 * and scrolls on. Each crate is stamped into a finished card as its centre
 * passes the press. Touch / reduced-motion fall back to a scroll-pinned belt
 * with the same visuals.
 */

const ICONS: Record<FactoryModuleKind, IconType> = {
  screens: FiMonitor,
  servers: FiServer,
  database: FiDatabase,
  gateway: FiShare2,
  cloud: FiCloud,
  gears: FiSettings,
};
const N = factoryModules.length;
const TOTAL = String(N).padStart(2, "0");
const WHEEL_TO_BELT = 0.45;
/** Page scroll per px of belt on the touch / reduced-motion fallback */
const TOUCH_RUNWAY = 1.8;
const SPEED = { wall: 0.3, machines: 0.6, fore: 1.5 } as const;

type Variant = "shipped" | "core" | "tool";
const VARIANT: Partial<Record<string, Variant>> = { backend: "core", automation: "tool" };
const STAMP: Record<Variant, string> = { shipped: "Shipped", core: "★ Core", tool: "Shipped" };

const rawName = (m: FactoryModule) => m.title.toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-");

function Gear({ size, teeth }: { size: number; teeth: number }) {
  const r = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      {Array.from({ length: teeth }, (_, i) => (
        <rect key={i} x={r - 7} y={0} width={14} height={18} fill="currentColor" transform={`rotate(${(360 / teeth) * i} ${r} ${r})`} />
      ))}
      <circle cx={r} cy={r} r={r - 12} fill="currentColor" />
      <circle cx={r} cy={r} r={r * 0.28} className="fill-surface" />
      <circle cx={r} cy={r} r={6} className="fill-accent" />
    </svg>
  );
}

/** A boiler with a gauge and a pair of gears */
function Machine({ left, flip }: { left: string; flip?: boolean }) {
  return (
    <div className="absolute bottom-0" style={{ left }}>
      <div className={cn("relative h-[30vh] w-[11vw] min-w-28", flip && "-scale-x-100")}>
        <span className="absolute -top-[9vh] left-[38%] h-[10vh] w-[1.4vw] min-w-3 bg-surface-2" />
        <div className="absolute inset-0 rounded-t-[2.2rem] bg-surface-2">
          <span className="absolute inset-x-0 top-[34%] h-[6px] bg-surface-3" />
          <span className="absolute inset-x-0 top-[62%] h-[6px] bg-surface-3" />
          <span className="absolute left-[38%] top-[44%] flex size-[2.6vw] min-h-6 min-w-6 items-center justify-center rounded-full bg-surface-3">
            <span className="size-[35%] rounded-full bg-accent" />
          </span>
        </div>
      </div>
      <div className="absolute -right-[3vw] bottom-0 flex items-end text-surface-3">
        <div data-gear className="will-change-transform">
          <Gear size={120} teeth={12} />
        </div>
        <div data-gear data-gear-reverse className="-mb-2 -ml-5 will-change-transform">
          <Gear size={78} teeth={9} />
        </div>
      </div>
    </div>
  );
}

/** A robot arm silhouette reaching over the belt */
function RobotArm({ left }: { left: string }) {
  return (
    <div className="absolute bottom-0 h-[34vh] w-[14vw] min-w-32" style={{ left }}>
      <span className="absolute bottom-0 left-[20%] h-[4vh] w-[50%] rounded-t-lg bg-surface-3" />
      <span className="absolute bottom-[3vh] left-[35%] h-[20vh] w-[1.6vw] min-w-3 origin-bottom rotate-[18deg] rounded-full bg-surface-2" />
      <span className="absolute bottom-[21vh] left-[48%] h-[1.6vw] min-h-3 w-[12vh] origin-left -rotate-[24deg] rounded-full bg-surface-2" />
      <span className="absolute bottom-[21.5vh] left-[46%] size-[1.8vw] min-h-4 min-w-4 rounded-full bg-surface-3" />
      <span className="absolute bottom-[2.5vh] left-[33%] size-[1.8vw] min-h-4 min-w-4 rounded-full bg-surface-3" />
    </div>
  );
}

/** One module on the belt: a raw box that the press turns into a product card */
function Crate({ m, index, onSelect }: { m: FactoryModule; index: number; onSelect: (i: number) => void }) {
  const Icon = ICONS[m.kind];
  const variant = VARIANT[m.id] ?? "shipped";
  const [first, ...rest] = m.title.split(" ");
  return (
    <button
      type="button"
      data-crate
      onClick={() => onSelect(index)}
      aria-label={`Module ${m.number}: ${m.title}. ${m.summary}`}
      className={cn("crate group relative h-[clamp(210px,30vh,290px)] w-[clamp(190px,15.2vw,260px)] shrink-0 text-left", variant === "core" && "crate--core")}
    >
      {/* Raw: dashed box with the module's icon */}
      <span className="crate__raw absolute inset-0 flex flex-col items-center justify-center gap-5 border-2 border-dashed border-accent bg-bg/40 transition-colors group-hover:bg-accent-wash">
        <Icon className="size-[clamp(2.4rem,4.6vh,3.4rem)] text-accent" aria-hidden="true" />
        <span className="max-w-[80%] break-words text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-muted">{rawName(m)}</span>
      </span>

      {/* Done: the finished product card (stays light in both themes, like a label) */}
      <span className="crate__done tone-light absolute inset-0 flex flex-col overflow-hidden bg-[#f3f5f8] text-[#111111] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)]">
        <span className={cn("block h-[10%] min-h-5 shrink-0", `crate__tape--${variant}`)} />
        <span className="flex flex-1 flex-col px-[8%] pt-[7%]">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5b6470]">
            <BrandMark className="size-3.5" /> Ayaan /
          </span>
          <span className="mt-2 text-[clamp(0.85rem,1.12vw,1.2rem)] leading-[1.05]">
            <span className="display">{first}</span> <span className="font-light lowercase text-[#4a525c]">{rest.join(" ")}</span>
          </span>
          <span className="mt-2.5 line-clamp-3 text-[12px] leading-snug text-[#3d4550]">{m.summary}</span>
        </span>
        <span className="flex shrink-0 items-center justify-between border-t border-[#d8dde4] px-[8%] py-2.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-blue-800">
          <span>{variant === "tool" ? "Tool" : `Module ${m.number}`}</span>
          <span className="truncate pl-2">{m.technologies.slice(0, 2).join(" · ")}</span>
        </span>
        <span
          className={cn(
            "crate__stamp absolute right-[6%] top-[15%] border-2 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em]",
            variant === "core" ? "border-blue-400 text-blue-500" : "border-blue-800 text-blue-800",
          )}
        >
          {STAMP[variant]}
        </span>
      </span>
    </button>
  );
}

export function FactorySection() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const rod = useRef<HTMLSpanElement>(null);
  const pressRef = useRef<HTMLDivElement>(null);
  const shippedRef = useRef<HTMLElement>(null);
  const goToRef = useRef<(i: number) => void>(() => {});
  useChapter(root, 2);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr) return;
    const reduced = prefersReducedMotion();
    const crates = Array.from(tr.querySelectorAll<HTMLElement>("[data-crate]"));
    const gears = Array.from(el.querySelectorAll<HTMLElement>("[data-gear]"));
    const setX = {
      track: gsap.quickSetter(tr, "x", "px"),
      wall: gsap.quickSetter(el.querySelector("[data-layer='wall']"), "x", "px"),
      machines: gsap.quickSetter(el.querySelector("[data-layer='machines']"), "x", "px"),
      fore: gsap.quickSetter(el.querySelector("[data-layer='fore']"), "x", "px"),
    };

    let centres: number[] = [];
    let travel = 0;
    const measure = () => {
      // Relative to the track (the crates' own offsetParent is an inner row)
      const origin = tr.getBoundingClientRect().left;
      centres = crates.map((c) => {
        const r = c.getBoundingClientRect();
        return r.left - origin + r.width / 2;
      });
      // The belt ends with the last crate under the press — or, on narrow
      // screens, just far enough to bring the whole dock into view
      const dock = tr.querySelector<HTMLElement>("[data-dock]")?.getBoundingClientRect();
      const dockEnd = dock ? dock.right - origin + 24 - window.innerWidth : 0;
      travel = Math.max(0, centres[N - 1] - window.innerWidth / 2, dockEnd);
      return travel;
    };
    measure();

    /** Places the belt and parallax layers for a belt offset of `px` (0..travel) */
    let cur = 0;
    const apply = (px: number) => {
      cur = px;
      setX.track(-px);
      setX.wall(-px * SPEED.wall);
      setX.machines(-px * SPEED.machines);
      setX.fore(-px * SPEED.fore);
      gears.forEach((g) => gsap.set(g, { rotation: (g.hasAttribute("data-gear-reverse") ? 0.6 : -0.4) * px }));
      el.style.setProperty("--spin", (0.45 * px).toFixed(1));
    };
    apply(0);

    /*
     * The press. Every frame it looks ahead: a crate that will reach the
     * press within one descent (0.12s at the belt's current speed) triggers a
     * strike. While the head comes down, the press trolley slides sideways to
     * meet the crate where it will be at impact, then rides along with it.
     * On impact the crate turns into its card, the head lifts (0.45s) and
     * the trolley eases back to centre. A crate the belt carries off more
     * than half a pitch before the head lands is finished without a hit;
     * one carried back past the press is a raw box again.
     */
    const DESCENT = 0.12;
    const RISE = 0.45;
    const press = pressRef.current;
    const rodEl = rod.current;
    const head = rodEl?.lastElementChild as HTMLElement | null | undefined;
    const trolley = { x: 0 };
    const setTrolley = (x: number) => {
      trolley.x = x;
      press?.style.setProperty("--trolley", `${x.toFixed(1)}px`);
    };
    let reach = 0;
    let halfPitch = 0;
    const measurePress = () => {
      halfPitch = (crates.length > 1 ? centres[1] - centres[0] : crates[0].offsetWidth) / 2;
      if (!rodEl || !head) return;
      gsap.set(rodEl, { y: 0 });
      reach = Math.max(0, crates[0].getBoundingClientRect().top - head.getBoundingClientRect().bottom);
    };
    measurePress();

    const offset = (i: number) => centres[i] - cur - window.innerWidth / 2;
    const sparks = () => {
      if (!press || !head) return;
      const h = head.getBoundingClientRect();
      const p = press.getBoundingClientRect();
      for (let k = 0; k < 18; k++) {
        const s = document.createElement("span");
        s.className = "factory-spark";
        s.style.left = `${h.left - p.left + h.width / 2}px`;
        s.style.top = `${h.bottom - p.top}px`;
        press.append(s);
        const a = (Math.PI * k) / 17;
        const d = gsap.utils.random(50, 140);
        gsap.fromTo(
          s,
          { x: 0, y: 0, scale: 1, opacity: 1 },
          {
            x: -Math.cos(a) * d,
            y: -Math.sin(a) * d * 0.8,
            scale: 0.2,
            opacity: 0,
            duration: gsap.utils.random(0.5, 0.9),
            ease: "power2.out",
            delay: 0.1,
            onComplete: () => s.remove(),
          },
        );
      }
    };
    const setShipped = () => {
      if (shippedRef.current) shippedRef.current.textContent = String(crates.filter((c) => c.classList.contains("is-done")).length).padStart(2, "0");
    };
    const finish = (i: number) => {
      crates[i].classList.add("is-done");
      setShipped();
      if (crates[i].classList.contains("crate--core")) sparks();
    };

    let strike: { i: number; from: number; descent: gsap.core.Tween } | null = null;
    const retract = () => {
      strike = null;
      if (rodEl) gsap.to(rodEl, { y: 0, duration: RISE, ease: "power2.out", overwrite: "auto" });
      gsap.to(trolley, { x: 0, duration: RISE + 0.25, ease: "power2.inOut", onUpdate: () => setTrolley(trolley.x) });
    };

    let prev: number | null = null;
    const pressTick = (_t: number, dtMs: number) => {
      const speed = prev === null ? 0 : (Math.max(0, cur - prev) / Math.max(dtMs, 1)) * 1000;

      // Steer the trolley onto the crate being struck
      if (strike) {
        const { i, from, descent } = strike;
        const now = offset(i);
        const s = descent.progress();
        const atImpact = now - speed * (1 - s) * DESCENT;
        if (Math.abs(atImpact) > halfPitch) {
          descent.kill();
          retract();
          if (atImpact < 0) finish(i);
        } else if (s < 1) setTrolley(from + (atImpact - from) * s);
        else {
          setTrolley(now);
          retract();
          finish(i);
        }
      }

      if (cur === prev) return;
      const forward = prev !== null && cur > prev;
      // Look at least a few px ahead, so a crate easing to a stop under the
      // press (the last one, always) is still met on time
      const lead = Math.max(speed * DESCENT, 24);
      prev = cur;

      let next = -1;
      crates.forEach((c, i) => {
        const e = offset(i);
        const done = c.classList.contains("is-done");
        if (forward) {
          if (done || strike?.i === i || e > lead) return;
          if (e - lead < -halfPitch) finish(i);
          else if (next < 0 || e > offset(next)) next = i;
        } else if (done && e > 12 && strike?.i !== i) {
          // Carried back past the press (with a little slack): a raw box again
          c.classList.remove("is-done");
          setShipped();
        }
      });

      if (next >= 0 && !strike && rodEl && Number(gsap.getProperty(rodEl, "y")) <= reach / 2) {
        gsap.killTweensOf(trolley);
        strike = { i: next, from: trolley.x, descent: gsap.to(rodEl, { y: reach, duration: DESCENT, ease: "power3.in", overwrite: "auto" }) };
      }
    };

    const onRefresh = () => {
      measure();
      measurePress();
    };
    window.addEventListener("resize", onRefresh);
    let stopPress = () => window.removeEventListener("resize", onRefresh);
    if (reduced) {
      crates.forEach((c) => c.classList.add("is-done"));
      if (shippedRef.current) shippedRef.current.textContent = TOTAL;
    } else {
      gsap.ticker.add(pressTick);
      stopPress = () => {
        window.removeEventListener("resize", onRefresh);
        gsap.ticker.remove(pressTick);
      };
    }

    /* ---------------- Fallback: a scroll-pinned belt ---------------- */
    const pinnedBelt = () => {
      const lenis = getLenis();
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${measure() * TOUCH_RUNWAY}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.progress * travel),
      });
      goToRef.current = (i) => {
        const y = Math.min(st.end, Math.max(st.start, st.start + (centres[i] - window.innerWidth / 2) * TOUCH_RUNWAY));
        if (lenis) lenis.scrollTo(y, { duration: 1.2 });
        else window.scrollTo({ top: y, behavior: "smooth" });
      };
      return () => {
        st.kill();
        stopPress();
      };
    };

    /* ---------------- Desktop: the wheel drives the belt ---------------- */
    const wheelBelt = (lenis: Lenis) => {
      let target = 0;
      let locked = false;
      let lastWheel = 0;
      const sectionY = () => el.getBoundingClientRect().top + window.scrollY;

      const lock = () => {
        locked = true;
        lenis.scrollTo(sectionY(), { immediate: true, force: true });
        lenis.stop();
      };
      const unlock = () => {
        locked = false;
        lenis.start();
      };

      // Each wheel step restarts a 1s power3.out glide towards the new target
      const belt = { x: 0 };
      const glide = (duration = 1) =>
        gsap.to(belt, { x: target, duration, ease: "power3.out", overwrite: true, onUpdate: () => apply(belt.x) });

      const onWheel = (e: WheelEvent) => {
        lastWheel = performance.now();
        if (!locked) return;
        const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
        // The page is only released once the last crate has been stamped
        const atEnd = target >= travel - 0.5 && cur >= travel - 2 && !strike && crates[N - 1].classList.contains("is-done");
        const atStart = target <= 0.5 && cur <= 2;
        // Belt finished in this direction — hand this wheel event back to the page
        if ((d > 0 && atEnd) || (d < 0 && atStart)) {
          unlock();
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        target = Math.min(travel, Math.max(0, target + d * WHEEL_TO_BELT));
        glide();
      };
      window.addEventListener("wheel", onWheel, { passive: false, capture: true });

      // Lock the page as the section's top meets the viewport's, from either side.
      // Direction comes from the page's real movement: lenis.start() emits a
      // scroll event with a stale direction, which would re-lock on release.
      let lastY = lenis.scroll;
      const offScroll = lenis.on("scroll", () => {
        const dir = Math.sign(lenis.scroll - lastY);
        lastY = lenis.scroll;
        if (locked || !dir || performance.now() - lastWheel > 400) return;
        const top = el.getBoundingClientRect().top;
        const half = window.innerHeight * 0.6;
        if (dir > 0 && top <= 0 && top > -half && target < travel - 0.5) lock();
        else if (dir < 0 && top >= 0 && top < half && target > 0.5) lock();
      });

      const onResize = () => {
        target = Math.min(target, travel);
        belt.x = Math.min(belt.x, travel);
        apply(belt.x);
      };
      window.addEventListener("resize", onResize);

      goToRef.current = (i) => {
        if (!locked) lock();
        target = Math.min(travel, Math.max(0, centres[i] - window.innerWidth / 2));
        glide(1.2);
      };

      return () => {
        window.removeEventListener("wheel", onWheel, { capture: true });
        window.removeEventListener("resize", onResize);
        offScroll();
        gsap.killTweensOf(belt);
        if (locked) lenis.start();
      };
    };

    // Touch and reduced motion never get Lenis — they use the pinned belt
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return pinnedBelt();
    let cleanup = () => {};
    const unsubscribe = onLenis((lenis) => {
      cleanup = wheelBelt(lenis);
    });
    return () => {
      unsubscribe();
      cleanup();
      stopPress();
    };
  }, []);

  return (
    <section
      id="factory"
      ref={root}
      data-tone-left="dark"
      data-tone-right="dark"
      aria-label="03 — The Factory: engineering"
      className="side-back relative h-[100svh] min-h-[640px] overflow-hidden"
    >
      {/* Wall: tall factory windows, 0.3× */}
      <div data-layer="wall" className="pointer-events-none absolute left-[-4vw] top-[24vh] flex gap-[7vw] will-change-transform" aria-hidden="true">
        {Array.from({ length: 14 }, (_, f) => (
          <div key={f} className="grid h-[42vh] w-[15vw] min-w-36 shrink-0 grid-cols-4 grid-rows-5 gap-[6px] border-[10px] border-surface-2 bg-surface-2">
            {Array.from({ length: 20 }, (_, c) => (
              <span key={c} className={(c * 7 + f * 5) % 11 === 0 ? "bg-accent/30" : "bg-bg"} />
            ))}
          </div>
        ))}
      </div>

      {/* Machines, 0.6× */}
      <div
        data-layer="machines"
        className="pointer-events-none absolute bottom-[calc(9vh+27px)] left-0 h-[40vh] w-[400vw] will-change-transform"
        aria-hidden="true"
      >
        <Machine left="5vw" />
        <RobotArm left="74vw" />
        <Machine left="118vw" flip />
        <RobotArm left="168vw" />
        <Machine left="214vw" />
        <RobotArm left="262vw" />
      </div>

      {/* Floor under the belt */}
      <div className="absolute inset-x-0 bottom-0 h-[9vh] bg-surface" aria-hidden="true" />

      {/* The moving strip: heading, rail, belt, crates and the dock — 1× */}
      <div ref={track} className="absolute inset-y-0 left-0 z-10 flex items-end pb-[calc(9vh+27px)] will-change-transform" style={{ paddingLeft: "calc(50vw + 5rem)" }}>
        {/* Heading rides the belt and leaves to the left */}
        <header className="absolute left-0 top-[11vh] w-screen px-6 text-center">
          <Reveal y={12}>
            <p className="eyebrow">
              <b>03</b>The Factory
            </p>
          </Reveal>
          <RevealHeading lines={[["Behind the products,"], [{ text: "an architecture.", em: true }]]} className="mt-3 text-[clamp(1.7rem,4vw,3.6rem)]" />
          <Reveal delay={0.2}>
            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-muted">
              Six engineering modules, each one running in production. Take one off the belt.
            </p>
            <p className="label mt-3 inline-flex items-center gap-3">
              <span className="h-px w-10 bg-accent" /> Scroll sideways <FiArrowRight aria-hidden="true" className="drift-x text-accent" />
            </p>
          </Reveal>
        </header>

        {/* Gantry rail and belt run the full length of the strip */}
        <span className="absolute inset-x-0 top-[44vh] h-[12px] border-y border-surface-3 bg-surface-2" aria-hidden="true">
          <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,var(--surface-3)_0_4px,transparent_4px_96px)]" />
        </span>
        <span className="absolute inset-x-0 bottom-[9vh] h-[27px] border-t-2 border-surface-3 bg-surface-2" aria-hidden="true">
          <span className="absolute inset-x-0 top-[3px] flex gap-[44px] px-3">
            {Array.from({ length: 90 }, (_, i) => (
              <i key={i} className="belt-roller relative block size-[19px] shrink-0 rounded-full border-2 border-muted">
                <span className="absolute inset-y-0.5 left-1/2 w-[2px] -translate-x-1/2 rotate-45 bg-muted" />
              </i>
            ))}
          </span>
          <span className="absolute inset-x-0 -bottom-[8px] h-[8px] bg-[repeating-linear-gradient(-45deg,var(--accent)_0_12px,transparent_12px_26px)]" />
        </span>

        <div className="relative flex items-end gap-[clamp(3rem,5.2vw,6rem)]">
          {factoryModules.map((m, i) => (
            <Crate key={m.id} m={m} index={i} onSelect={(n) => goToRef.current(n)} />
          ))}

          {/* Dock at the end of the line */}
          <a
            data-dock
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className="group relative ml-[6vw] flex h-[clamp(210px,30vh,290px)] w-[clamp(270px,21vw,340px)] shrink-0 flex-col items-start justify-start"
          >
            <span className="label">{TOTAL} modules · in production</span>
            <span className="mt-3 flex h-14 w-full items-center justify-between bg-accent pl-5 pr-10 text-white transition-transform duration-300 [clip-path:polygon(0_0,85%_0,100%_50%,85%_100%,0_100%)] group-hover:translate-x-2">
              <span className="display whitespace-nowrap text-[clamp(1rem,1.4vw,1.3rem)]">All on GitHub</span>
              <FiGithub className="size-6" aria-hidden="true" />
            </span>
            <span className="absolute bottom-0 left-[38%] top-[calc(17px+0.75rem+3.5rem)] w-1.5 bg-surface-3" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* The press, fixed at the centre: hangs from the rail and stops just
          above the crates (the shaft takes up whatever height is left) */}
      <div
        ref={pressRef}
        className="absolute bottom-[calc(9vh+27px+clamp(210px,30vh,290px)+3.4vh)] left-1/2 top-[min(44vh,calc(91vh-27px-clamp(210px,30vh,290px)-3.4vh-96px))] z-20 flex flex-col"
        style={{ translate: "calc(-50% + var(--trolley, 0px)) 0" }}
      >
        <a
          href={`mailto:${profile.email}?subject=${encodeURIComponent("New project")}`}
          className="pill pill-accent absolute -top-1 left-[calc(100%+1rem)] !h-8 whitespace-nowrap !px-3.5 !text-[10px]"
        >
          Start a project <FiArrowUpRight aria-hidden="true" />
        </a>
        <div aria-hidden="true" className="relative flex min-h-0 flex-1 flex-col">
          {["left-[22%]", "right-[22%]"].map((side) => (
            <span key={side} className={cn("press-wheel absolute -top-3 size-5 rounded-full border-2 border-muted bg-surface-3", side)} />
          ))}
          <span className="relative flex h-[10vh] min-h-10 w-[min(11vw,180px)] min-w-36 shrink items-center justify-center gap-[1.4vw] rounded-b-lg bg-surface-3">
            <i className="press-light size-3.5 rounded-full bg-blue-300 [animation-duration:1.4s]" />
            <i className="press-light size-3.5 rounded-full bg-accent [animation-duration:2.1s]" />
            <i className="press-light size-3.5 rounded-full bg-blue-300 [animation-duration:0.9s]" />
          </span>
          <span ref={rod} className="flex flex-1 flex-col will-change-transform">
            <span className="mx-auto block min-h-1.5 w-7 flex-1 bg-surface-2" />
            <span className="mx-auto block h-3.5 w-[min(9.5vw,160px)] min-w-32 shrink-0 rounded-sm bg-accent" />
          </span>
        </div>
      </div>

      {/* Foreground pillars sweep past, 1.5× */}
      <div data-layer="fore" className="pointer-events-none absolute inset-y-0 left-0 z-30 will-change-transform" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="absolute inset-y-0 w-[72px] bg-[#1d2733] dark:bg-[#060708]" style={{ left: `calc(${i * 120 + 85}vw)` }}>
            <span className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.35)_1.5px,transparent_2px)] bg-[length:4px_60px]" />
          </span>
        ))}
      </div>

      {/* Shipped counter */}
      <p className="absolute bottom-[3vh] left-[4vw] z-20 font-mono text-[11px] uppercase tracking-[0.2em] text-ink">
        <b ref={shippedRef} className="font-normal text-accent">
          00
        </b>{" "}
        / {TOTAL} shipped
      </p>
    </section>
  );
}
