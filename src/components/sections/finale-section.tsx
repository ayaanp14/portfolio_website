"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUp, FiChevronRight } from "react-icons/fi";

import { profile } from "@/data/profile";
import { getLenis } from "@/lib/lenis-store";
import { useChapter } from "@/components/interactions/use-chapter";
import { Character } from "@/components/art/character";
import { BrandMark } from "@/components/navigation/brand";
import { Reveal } from "@/components/ui/reveal";

gsap.registerPlugin(ScrollTrigger);

const CITY = [
  { x: 6, w: 9, h: 24 },
  { x: 17, w: 6, h: 16 },
  { x: 26, w: 8, h: 34 },
  { x: 36, w: 7, h: 20 },
];

function CityBlock({ w, h, x }: { w: number; h: number; x: number }) {
  return (
    <div className="absolute bottom-0 grid grid-cols-3 content-start gap-[0.7vw] bg-surface-2 p-[1.1vw]" style={{ left: `${x}%`, width: `${w}%`, height: `${h}vh` }}>
      {Array.from({ length: Math.floor(h / 5) * 3 }, (_, i) => (
        <span
          key={i}
          className={(i * 5 + x) % 11 === 0 ? "flicker aspect-square bg-blue-800" : "aspect-square bg-bg"}
          style={(i * 5 + x) % 11 === 0 ? { animationDelay: `${-((i + x) % 9) * 0.7}s` } : undefined}
        />
      ))}
    </div>
  );
}

export function FinaleSection() {
  const root = useRef<HTMLElement>(null);
  useChapter(root, 5);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        q("[data-slice]"),
        { clipPath: "inset(50% 0 50% 0)", y: 20 },
        { clipPath: "inset(0% 0 0% 0)", y: 0, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 75%", end: "top 25%", scrub: true } },
      );
      gsap.fromTo(
        q("[data-rise]"),
        { yPercent: 100 },
        { yPercent: 0, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 60%", end: "top top", scrub: true } },
      );
      gsap.fromTo(
        q("[data-sun]"),
        { y: "40%", scale: 0.85 },
        { y: "0%", scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: true } },
      );
      gsap.fromTo(q("[data-ground-cta]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, scrollTrigger: { trigger: el, start: "top 20%", toggleActions: "play none none reverse" } });
    }, el);
    return () => ctx.revert();
  }, []);

  const backToTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 2.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <section id="contact" ref={root} data-tone-left="light" data-tone-right="dark" aria-label="06 — Let's build something: contact" className="relative h-[100svh] min-h-[620px] overflow-hidden">
        {/* FRONT half — city */}
        <div className="side-front absolute inset-y-0 left-0 w-1/2 overflow-hidden" aria-hidden="true">
          <span className="cloud absolute left-[8%] top-[20vh] h-5 w-44 rounded-full bg-surface-2" />
          <span className="cloud absolute left-[46%] top-[8vh] h-4 w-36 rounded-full bg-surface [animation-delay:-5s]" />
          <span data-sun className="absolute bottom-[22vh] right-[14%] size-[clamp(9rem,15vw,15rem)] translate-y-1/3 rounded-full bg-blue-800" />
          <div className="absolute inset-x-0 bottom-[22vh] h-[40vh]">
            {CITY.map((b) => (
              <CityBlock key={b.x} {...b} />
            ))}
            <CityBlock x={64} w={11} h={22} />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[22vh] border-t-[3px] border-ink bg-surface-2" />
        </div>

        {/* BACK half — industry */}
        <div className="side-back absolute inset-y-0 right-0 w-1/2 overflow-hidden" aria-hidden="true">
          {[
            [12, 18], [40, 9], [64, 26], [86, 14], [28, 34], [74, 40],
          ].map(([x, y], i) => (
            <span
              key={`${x}${y}`}
              className="twinkle absolute size-[3px] rounded-full bg-ink/50"
              style={{ left: `${x}%`, top: `${y}vh`, animationDelay: `${-i * 0.6}s` }}
            />
          ))}
          <svg className="absolute inset-x-0 bottom-[22vh] h-[12vh] w-full" viewBox="0 0 600 100" preserveAspectRatio="none">
            <path d="M0 100 L0 60 L70 20 L70 60 L140 20 L140 60 L210 20 L210 60 L280 20 L280 60 L350 20 L350 60 L420 20 L420 60 L490 20 L490 60 L560 20 L560 60 L600 40 L600 100 Z" className="fill-surface-2" />
          </svg>
          {[
            { x: 62, h: 30, cap: "bg-blue-400" },
            { x: 82, h: 22, cap: "bg-blue-800" },
          ].map((c, i) => (
            <div key={c.x} className="absolute bottom-[22vh] w-[4.5%] min-w-6 bg-surface-2" style={{ left: `${c.x}%`, height: `${c.h}vh` }}>
              <span className={`absolute inset-x-0 top-0 h-2 ${c.cap}`} />
              {[0, 1, 2].map((s) => (
                <span
                  key={s}
                  className="smoke absolute -top-8 left-0 size-10 rounded-full bg-surface-3"
                  style={{ animationDelay: `${-(s * 2 + i)}s` }}
                />
              ))}
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-[22vh] h-2 bg-[repeating-linear-gradient(90deg,var(--blue-950)_0_26px,transparent_26px_60px)]" />
          <div className="absolute inset-x-0 bottom-0 h-[22vh] border-t-[3px] border-line-strong bg-surface-2" />
        </div>

        {/* Headline */}
        <div className="pointer-events-none absolute inset-x-0 top-[13vh] z-10 grid grid-cols-2">
          <div className="side-front !bg-transparent pr-[2.5vw] text-right">
            <p className="eyebrow mb-4">
              <b>06</b>Contact
            </p>
            <h2 data-slice className="display text-[clamp(1.4rem,3.6vw,3.4rem)]">
              Have an
              <br />
              <span className="hl">idea?</span>
            </h2>
          </div>
          <div className="side-back !bg-transparent pl-[2.5vw] pt-[calc(11px+1rem+0.4em)]">
            <p data-slice className="display text-[clamp(1.4rem,3.6vw,3.4rem)]">
              Let&apos;s bring
              <br />
              it to <span className="hl">life.</span>
            </p>
          </div>
        </div>

        {/* Character */}
        <div data-rise className="pointer-events-none absolute bottom-[22vh] left-1/2 z-10 h-[46vh] -translate-x-1/2 max-md:h-[34vh]" aria-hidden="true">
          <Character className="h-full w-auto" showRuler={false} />
        </div>

        {/* Ground CTAs */}
        <div data-ground-cta className="absolute inset-x-0 bottom-[8vh] z-20 flex items-center justify-center gap-3 px-4 max-sm:flex-col">
          <a href={`mailto:${profile.email}?subject=${encodeURIComponent("New project")}`} className="pill pill-accent !h-12">
            Start a project <FiChevronRight aria-hidden="true" />
          </a>
          <a href={`mailto:${profile.email}`} className="bg-white px-4 py-2.5 font-mono text-xs text-ink-light transition-colors hover:text-blue-800">
            {profile.email}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer data-tone-left="light" data-tone-right="light" className="side-front grid-lines px-[4vw] pt-16">
        <div className="grid grid-cols-1 gap-10 border-b border-line pb-14 md:grid-cols-12">
          <BrandMark className="size-12 md:col-span-1" />
          <Reveal className="md:col-span-7">
            <p className="label">Get in touch</p>
            <a href={`mailto:${profile.email}`} className="mt-4 block text-[clamp(1.4rem,3vw,2.4rem)] font-medium hover:text-accent">
              {profile.email}
            </a>
            <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="label mt-4 block hover:text-accent">
              {profile.phone}
            </a>
            <p className="label mt-2">{profile.location}</p>
          </Reveal>
          <ul className="flex gap-6 md:col-span-4 md:justify-end">
            <li>
              <a href={profile.links.github} target="_blank" rel="noreferrer" className="label link-sweep text-ink">
                GitHub.
              </a>
            </li>
            <li>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="label link-sweep text-ink">
                LinkedIn.
              </a>
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="label">© {new Date().getFullYear()} Ayaan Pathan</p>
          <p className="label">Ayaan Pathan — Software developer</p>
          <button type="button" onClick={backToTop} className="label inline-flex items-center gap-2 text-ink hover:text-accent">
            Back to top <FiArrowUp aria-hidden="true" />
          </button>
        </div>
      </footer>
    </>
  );
}
