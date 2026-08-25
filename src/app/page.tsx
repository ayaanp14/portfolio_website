import { SmoothScroll } from "@/components/core/smooth-scroll";
import { BackgroundGrid } from "@/components/core/background-grid";
import { BootSequence } from "@/components/core/boot-sequence";
import { SystemCursor } from "@/components/core/system-cursor";
import { Header } from "@/components/core/header";
import { SocialRail } from "@/components/core/social-rail";
import { Footer } from "@/components/core/footer";
import { Hero } from "@/components/home/hero";
import { ArchitectureSection } from "@/components/home/architecture-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { ExperienceTimeline } from "@/components/home/experience-timeline";
import { Terminal } from "@/components/home/terminal";
import { TechOrbit } from "@/components/home/tech-orbit";
import { Exploring } from "@/components/home/exploring";
import { GithubActivity } from "@/components/home/github-activity";
import { Contact } from "@/components/home/contact";

export default function HomePage() {
  return (
    <SmoothScroll>
      <BackgroundGrid />
      <SystemCursor />
      <Header />
      <SocialRail />

      <div className="scanline-overlay" aria-hidden="true" />
      <div className="vignette-overlay" aria-hidden="true" />

      <main>
        <Hero />
        <ArchitectureSection />
        <ProjectsSection />

        <section
          id="experience"
          aria-label="Experience, terminal and technology stack"
          className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 px-5 py-12 md:px-8 lg:grid-cols-3 xl:pr-20"
        >
          <ExperienceTimeline />
          <Terminal />
          <div id="stack">
            <TechOrbit />
          </div>
        </section>

        <section
          id="contact"
          aria-label="Currently exploring, GitHub activity and contact"
          className="mx-auto grid max-w-[1500px] grid-cols-1 gap-4 px-5 pb-16 md:px-8 lg:grid-cols-3 xl:pr-20"
        >
          <Exploring />
          <GithubActivity />
          <Contact />
        </section>
      </main>

      <Footer />
      <BootSequence />
    </SmoothScroll>
  );
}
