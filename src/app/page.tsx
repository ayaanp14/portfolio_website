import { SmoothScroll } from "@/components/core/smooth-scroll";
import { Cursor } from "@/components/interactions/cursor";
import { Loader } from "@/components/interactions/loader";
import { MagneticPills } from "@/components/interactions/magnetic-pills";
import { ThemeController } from "@/components/interactions/theme-toggle";
import { TiltCards } from "@/components/interactions/tilt-cards";
import { Navbar } from "@/components/navigation/navbar";
import { HeroSection } from "@/components/sections/hero-section";
import { StreetSection } from "@/components/sections/street-section";
import { FactorySection } from "@/components/sections/factory-section";
import { HoodSection } from "@/components/sections/hood-section";
import { MissionsSection } from "@/components/sections/missions-section";
import { FinaleSection } from "@/components/sections/finale-section";

/**
 * AYAAN IN THE CODE — every product has two sides.
 * Six chapters: the split story, the street of shipped products, the
 * factory behind them, the developer, the missions, and the finale.
 */
export default function HomePage() {
  return (
    <SmoothScroll>
      <ThemeController />
      <Navbar />
      <main>
        <HeroSection />
        <StreetSection />
        <FactorySection />
        <HoodSection />
        <MissionsSection />
        <FinaleSection />
      </main>
      <Loader />
      <MagneticPills />
      <Cursor />
      <TiltCards />
    </SmoothScroll>
  );
}
