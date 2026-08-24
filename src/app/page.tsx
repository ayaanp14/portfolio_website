import { SmoothScroll } from "@/components/core/smooth-scroll";
import { InteractiveBackground } from "@/components/core/interactive-background";
import { Preloader } from "@/components/core/preloader";
import { Header } from "@/components/core/header";
import { CursorDot } from "@/components/core/cursor-dot";
import { HeroKinetic } from "@/components/home/hero-kinetic";
import { Manifesto } from "@/components/home/manifesto";
import { SkillsWall } from "@/components/home/skills-wall";
import { ProjectsGallery } from "@/components/home/projects-gallery";
import { ExperienceTimeline } from "@/components/home/experience-timeline";
import { ContactCta } from "@/components/home/contact-cta";

export default function HomePage() {
  return (
    <SmoothScroll>
      <InteractiveBackground />
      <CursorDot />
      <Header />
      <div className="grain-overlay" aria-hidden="true" />
      <main>
        <HeroKinetic />
        <Manifesto />
        <SkillsWall />
        <ProjectsGallery />
        <ExperienceTimeline />
        <ContactCta />
      </main>
      <Preloader />
    </SmoothScroll>
  );
}
