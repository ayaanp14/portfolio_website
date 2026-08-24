"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight } from "react-icons/fi";

import { Magnetic } from "@/components/motion/magnetic";
import { profile } from "@/data/profile";

gsap.registerPlugin(ScrollTrigger);

export function ContactCta() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-cta-line]",
        { yPercent: 120 },
        {
          yPercent: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power4.out",
          scrollTrigger: { trigger: root, start: "top 70%" },
        },
      );

      // The whole block breathes in with scroll
      gsap.fromTo(
        "[data-cta-scale]",
        { scale: 0.94 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top bottom", end: "center center", scrub: true },
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  const year = new Date().getFullYear();

  return (
    <section
      ref={rootRef}
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden bg-ink pt-28 text-paper md:pt-36"
    >
      <div data-cta-scale className="container-page will-change-transform">
        <p className="mb-8 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.35em] text-paper/50">
          <span className="font-display font-bold text-accent">05</span> Next Step
        </p>

        <h2 id="contact-title" className="font-display font-bold uppercase leading-[0.9] tracking-tight">
          <span data-cta-line className="block overflow-hidden text-[clamp(3.4rem,12vw,10rem)] will-change-transform">
            Let&apos;s
          </span>
          <span
            data-cta-line
            className="block overflow-hidden text-[clamp(3.4rem,12vw,10rem)] text-transparent will-change-transform"
            style={{ WebkitTextStroke: "1.5px var(--color-paper)" }}
          >
            Build
          </span>
          <span data-cta-line className="block overflow-hidden text-[clamp(3.4rem,12vw,10rem)] text-accent will-change-transform">
            Together
          </span>
        </h2>

        <div className="mt-12 flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <p className="max-w-md text-base leading-7 text-paper/60">
            Open to full-stack roles, freelance SaaS builds, and interesting product ideas.
            My inbox is always open.
          </p>

          <Magnetic strength={0.2}>
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex items-center gap-4 rounded-full bg-accent px-9 py-5 font-display text-base font-bold uppercase tracking-widest text-paper transition-transform duration-300 hover:scale-105"
            >
              Say Hello
              <FiArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45" aria-hidden="true" />
            </a>
          </Magnetic>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-paper/15">
        <div className="container-page flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs uppercase tracking-[0.25em] text-paper/45">
            © {year} {profile.name} — Built with Next.js, GSAP &amp; Lenis
          </p>

          <div className="flex items-center gap-7 text-xs font-medium uppercase tracking-[0.25em]">
            <a href={profile.links.github} target="_blank" rel="noreferrer" className="link-sweep">
              GitHub
            </a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="link-sweep">
              LinkedIn
            </a>
            <a href={`mailto:${profile.email}`} className="link-sweep">
              Email
            </a>
            <span className="text-paper/40">{profile.phone}</span>
          </div>
        </div>
      </footer>
    </section>
  );
}
