"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowDown, FiArrowUpRight, FiGithub, FiLinkedin, FiMail, FiMapPin } from "react-icons/fi";

import { profile } from "@/data/profile";
import { useSystemStore } from "@/lib/system-store";
import { useSite } from "@/lib/site-store";
import { prefersReducedMotion } from "@/lib/quality";
import { getLenis } from "@/lib/lenis-store";
import { useChapter } from "@/components/interactions/use-chapter";
import { BackArtboard, FrontArtboard } from "@/components/art/hero-art";
import { LazyOrbitScene } from "@/components/three/lazy-orbit-scene";
import { LazyDeveloperBust } from "@/components/three/lazy-developer-bust";
import { heroBust } from "@/components/three/bust-progress";

gsap.registerPlugin(ScrollTrigger);

/** Scales the 720×900 artboards to their half of the screen. */
function useArtScale(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const w = window.innerWidth / 2;
      const h = window.innerHeight;
      const fit = Math.min(w / 720, h / 900);
      el.style.setProperty("--art", String(Math.max(fit, 0.5)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);
}

/** Artboard pieces drift against the pointer, nearer pieces further. */
function usePointerParallax(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]")).map((node) => ({
      depth: Number(node.dataset.depth),
      x: gsap.quickTo(node, "x", { duration: 0.9, ease: "power3.out" }),
      y: gsap.quickTo(node, "y", { duration: 0.9, ease: "power3.out" }),
    }));
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      layers.forEach((l) => {
        l.x(nx * -26 * l.depth);
        l.y(ny * -18 * l.depth);
      });
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [ref]);
}

export function HeroSection() {
  const root = useRef<HTMLElement>(null);
  const terminal = useRef<HTMLDivElement>(null);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const booted = useSystemStore((s) => s.booted);
  useChapter(root, 0);
  useArtScale(root);
  usePointerParallax(root);

  // Entrance, built paused behind the loader and played as the curtain opens
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      intro.current = gsap
        .timeline({ paused: true, delay: 0.35, defaults: { ease: "expo.out" } })
        .from(q("[data-intro-line]"), { yPercent: 115, duration: 1.1, stagger: 0.12 }, 0)
        .from(q("[data-intro-rule]"), { scaleX: 0, duration: 1.2, stagger: 0.1 }, 0.3)
        .from(q("[data-left] [data-pop]"), { y: 90, autoAlpha: 0, duration: 1.1, stagger: 0.09 }, 0.15)
        .from(q("[data-right] [data-pop]"), { y: 90, autoAlpha: 0, duration: 1.1, stagger: 0.09 }, 0.25)
        .from(q("[data-draw]"), { strokeDasharray: 1, strokeDashoffset: 1, duration: 1, ease: "power2.inOut" }, 0.8)
        .from(q("[data-badge-front]"), { xPercent: -60, autoAlpha: 0, duration: 1 }, 0.45)
        .from(q("[data-badge-back]"), { xPercent: 60, autoAlpha: 0, duration: 1 }, 0.45)
        .from(q("[data-badge-vs]"), { scale: 0, rotation: -180, duration: 0.9, ease: "back.out(2)" }, 0.6)
        .from(q("[data-badge-cta]"), { y: 24, autoAlpha: 0, duration: 0.8 }, 0.9);
    }, el);
    return () => {
      intro.current = null;
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (booted) intro.current?.play();
  }, [booted]);

  // Terminal types itself once the loader lifts
  useEffect(() => {
    const el = terminal.current;
    if (!booted || !el) return;
    const lines = Array.from(el.querySelectorAll<HTMLParagraphElement>("[data-line]"));
    if (prefersReducedMotion()) {
      lines.forEach((l) => (l.textContent = l.dataset.line ?? ""));
      return;
    }
    const tl = gsap.timeline({ delay: 1.3 });
    lines.forEach((l) => {
      const full = l.dataset.line ?? "";
      const out = !full.startsWith("$");
      const p = { n: 0 };
      tl.to(p, {
        n: full.length,
        duration: out ? 0.25 : full.length * 0.045,
        ease: "none",
        onUpdate: () => (l.textContent = full.slice(0, Math.round(p.n))),
      }, out ? "+=0.15" : "+=0.35");
    });
    return () => {
      tl.kill();
    };
  }, [booted]);

  // The story: halves part, the developer appears, the halves close around him
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);

    const ctx = gsap.context(() => {
      heroBust.build = 0;
      gsap.set(q("[data-char]"), { yPercent: 105 });
      gsap.set(q("[data-beat2], [data-final], [data-tagline], [data-stage-a], [data-stage-b]"), { autoAlpha: 0, y: 30 });

      const open = () => window.innerWidth * 0.31;

      gsap
        .timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            refreshPriority: 2,
            onLeave: () => useSite.getState().setInStory(false),
            onEnterBack: () => useSite.getState().setInStory(true),
          },
        })
        // Beats overlap so every stretch of scroll moves something
        .to(q("[data-beat1], [data-badge]"), { autoAlpha: 0, y: -24, duration: 0.6, stagger: 0.05 }, 0)
        .to(q("[data-left]"), { x: () => -open(), duration: 1.6 }, 0.15)
        .to(q("[data-right]"), { x: () => open(), duration: 1.6 }, 0.15)
        .to(q("[data-stage-a]"), { autoAlpha: 1, y: 0, duration: 0.6 }, 0.7)
        .to(q("[data-char]"), { yPercent: 0, duration: 1.4, ease: "power3.out" }, 0.9)
        // The blueprint half of the 3D model prints upward
        .to(heroBust, { build: 1, duration: 1.8, ease: "none" }, 1.6)
        .to(q("[data-stage-a]"), { autoAlpha: 0, y: -24, duration: 0.5 }, 2.1)
        .to(q("[data-stage-b]"), { autoAlpha: 1, y: 0, duration: 0.6 }, 2.4)
        .to(q("[data-tagline]"), { autoAlpha: 1, y: 0, duration: 0.5 }, 3.0)
        .to(q("[data-stage-b]"), { autoAlpha: 0, y: -24, duration: 0.5 }, 3.6)
        .to(q("[data-left], [data-right]"), { x: 0, duration: 1.4 }, 3.6)
        .to(q("[data-beat2]"), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 4.4)
        .to(q("[data-final]"), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 }, 4.7)
        // Continuous drift underneath the beats
        .fromTo(q("[data-stage-bg]"), { yPercent: 0 }, { yPercent: -6, duration: 5.6, ease: "none" }, 0)
        .fromTo(q("[data-char]"), { scale: 0.94 }, { scale: 1.03, duration: 4.7, ease: "none", immediateRender: false }, 0.9);
    }, el);

    return () => ctx.revert();
  }, []);

  // Advance the story by one beat
  const advance = () => {
    const y = window.scrollY + window.innerHeight * 1.1;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section
      id="index"
      ref={root}
      data-tone-left="light"
      data-tone-right="dark"
      data-header-fade="off"
      aria-label="Index — Ayaan Pathan, the developer who builds both sides"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-bg"
    >
      <h1 className="sr-only">Ayaan Pathan — Software Developer, Product Builder, Full Stack Engineer</h1>

      {/* Stage revealed between the halves */}
      <div data-stage-bg className="side-back dot-grid absolute inset-x-0 -bottom-[8%] top-0 will-change-transform" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_50%_100%,var(--stage-glow),transparent_65%)]" />
      </div>
      {/* 3D orbit behind the developer, revealed as the halves part */}
      <LazyOrbitScene variant="hero" className="absolute inset-0" />
      <div className="side-back pointer-events-none absolute left-1/2 top-[13vh] z-[5] w-[58vw] -translate-x-1/2 !bg-transparent text-center">
        <p data-stage-a className="display text-[clamp(1.2rem,2.9vw,2.6rem)]">
          Most products stop at <span className="hl">the idea.</span>
        </p>
        <p data-stage-b className="display absolute inset-x-0 top-0 text-[clamp(1.2rem,2.9vw,2.6rem)]">
          I build <span className="hl">what comes next.</span>
        </p>
        <span className="mx-auto mt-6 block h-px w-32 bg-line-strong" />
      </div>

      {/* FRONT half */}
      <div data-left className="side-front grid-lines absolute inset-y-0 left-0 z-10 w-1/2 overflow-hidden will-change-transform">
        <div className="absolute left-0 top-1/2 origin-left" style={{ transform: "translateY(-50%) scale(var(--art,1))" }}>
          <FrontArtboard />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[7vh] bg-surface-2" aria-hidden="true" />
        <div className="absolute right-[3.5vw] top-[12vh] text-right">
          <p data-beat1 className="display overflow-hidden pb-[0.08em] text-[clamp(1.25rem,3.3vw,3rem)]">
            <span data-intro-line className="block">
              Every <span className="hl">product</span>
            </span>
          </p>
          <p data-beat2 className="display absolute right-0 top-0 whitespace-nowrap text-[clamp(1.25rem,3.3vw,3rem)]">
            One <span className="hl">developer.</span>
          </p>
          <span data-intro-rule className="ml-auto mt-5 block h-px w-32 origin-right bg-line-strong" />
        </div>
        <div data-final className="absolute bottom-[9vh] left-[3vw] z-10 hidden max-w-[25vw] rounded-xl border border-line bg-bg/95 p-6 backdrop-blur lg:block">
          <p className="text-[15px] leading-relaxed text-muted">
            I build scalable applications, developer tools, and digital products through engineering and creativity.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#street" className="pill pill-accent">
              Explore my work <FiArrowDown aria-hidden="true" />
            </a>
            <a href="#contact" className="pill pill-outline bg-bg">
              Get in touch <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* BACK half */}
      <div data-right className="side-back absolute inset-y-0 right-0 z-10 w-1/2 overflow-hidden will-change-transform">
        <div className="absolute right-0 top-1/2 origin-right" style={{ transform: "translateY(-50%) scale(var(--art,1))" }}>
          <BackArtboard ref={terminal} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[7vh] bg-surface-2" aria-hidden="true" />
        <div className="absolute left-[3.5vw] top-[12vh]">
          <p data-beat1 className="display overflow-hidden pb-[0.08em] text-[clamp(1.25rem,3.3vw,3rem)]">
            <span data-intro-line className="block">
              Has an <span className="hl">idea…</span>
            </span>
          </p>
          <p data-beat2 className="display absolute left-0 top-0 whitespace-nowrap text-[clamp(1.25rem,3.3vw,3rem)]">
            Both <span className="hl">sides.</span>
          </p>
          <span data-intro-rule className="mt-5 block h-px w-32 origin-left bg-line-strong" />
        </div>
        <div data-final className="absolute bottom-[9vh] right-[4vw] z-10 hidden flex-col items-end gap-4 rounded-xl border border-line bg-surface/95 p-6 backdrop-blur lg:flex">
          <span className="label inline-flex items-center gap-2 text-ink">
            <FiMapPin aria-hidden="true" className="text-accent" /> {profile.location}
          </span>
          <div className="flex items-center gap-5 text-ink">
            <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-accent">
              <FiGithub aria-hidden="true" />
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-accent">
              <FiLinkedin aria-hidden="true" />
            </a>
            <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`} className="hover:text-accent">
              <FiMail aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* The developer — sits above both halves */}
      <div data-char className="pointer-events-none absolute bottom-0 left-1/2 z-20 aspect-[11/10] h-[min(70vh,660px)] origin-bottom -translate-x-1/2 will-change-transform max-md:h-[52vh]">
        <LazyDeveloperBust progress={heroBust} className="h-full w-full" />
      </div>

      <div data-tagline className="absolute bottom-[4vh] left-1/2 z-30 -translate-x-1/2 whitespace-nowrap bg-paper px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-light md:px-5 md:text-xs">
        Ayaan Pathan · Software developer · Product builder
      </div>

      {/* Mobile CTA (desktop shows them in each half) */}
      <div data-final className="absolute inset-x-0 bottom-[11vh] z-30 flex justify-center gap-2 px-4 lg:hidden">
        <a href="#street" className="pill pill-accent !h-10 !px-4">
          My work <FiArrowDown aria-hidden="true" />
        </a>
        <a href="#contact" className="pill !h-10 bg-white !px-4 text-ink-light">
          Contact <FiArrowUpRight aria-hidden="true" />
        </a>
      </div>

      {/* FRONT vs BACK badge */}
      <div data-badge className="absolute left-1/2 top-[54%] z-30 flex w-max -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        {/* Equal outer columns keep the vs disc on the page's centre line */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center">
          <span data-badge-front className="display rounded-l-full text-right bg-paper-3 py-3 pl-8 pr-14 text-[clamp(1rem,3.4vw,3rem)] text-blue-800 max-md:pl-4 max-md:pr-9">Front</span>
          <span data-badge-vs className="relative z-10 -mx-8 flex size-[clamp(3.2rem,6vw,5.4rem)] items-center justify-center rounded-full bg-blue-800 font-mono text-[clamp(.8rem,1.4vw,1.25rem)] text-white max-md:-mx-6">
            <span className="ping-ring absolute inset-0 rounded-full border-2 border-blue-400" aria-hidden="true" />
            <span className="ping-ring absolute inset-0 rounded-full border-2 border-blue-400 [animation-delay:1.2s]" aria-hidden="true" />
            vs
          </span>
          <span data-badge-back className="display rounded-r-full text-left bg-night-3 py-3 pl-14 pr-8 text-[clamp(1rem,3.4vw,3rem)] text-blue-400 max-md:pl-9 max-md:pr-4">Back</span>
        </div>
        <div data-badge-cta className="mt-8">
          <button type="button" onClick={advance} className="pill pill-accent">
            Scroll down <FiArrowDown aria-hidden="true" className="float-y [animation-duration:1.6s]" />
          </button>
        </div>
      </div>
    </section>
  );
}
