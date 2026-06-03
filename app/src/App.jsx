import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import ScrollFrames from "./components/ScrollFrames";
import PerspectiveGrid from "./components/PerspectiveGrid";
import SectionTint from "./components/SectionTint";
import GlobalParticleField from "./components/GlobalParticleField";
import Cursor from "./components/Cursor";
import CursorTrail from "./components/CursorTrail";
import Grain from "./components/Grain";
import ScrollProgress from "./components/ScrollProgress";
import Loader from "./components/Loader";
import Marquee from "./components/Marquee";
import Navbar from "./components/Navbar";
import ConciergeChat from "./components/ConciergeChat";
import Hero from "./sections/Hero";
import Difference from "./sections/Difference";
import Features from "./sections/Features";
import Showcase from "./sections/Showcase";
import ConfidenceCapsule from "./sections/ConfidenceCapsule";
import Pricing from "./sections/Pricing";
import Faq from "./sections/Faq";
import Apply from "./sections/Apply";
import Footer from "./sections/Footer";
import useLenis from "./lib/useLenis";
import { LangProvider } from "./lib/lang";
import { fx } from "./lib/store";

export default function App() {
  const [ready, setReady] = useState(false);

  useLenis(!ready);

  useEffect(() => {
    const onMove = (e) => {
      fx.px = (e.clientX / window.innerWidth) * 2 - 1;
      fx.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <LangProvider>
      <ScrollFrames />
      {/* Cinematic deep-space frame — very faint vanishing-point grid
          that sits between the marble and the tint. Adds depth without
          competing with content. */}
      <PerspectiveGrid />
      {/* Section-driven colour overlay — gives each section its own
          "lighting", smoothly blended across the scroll. */}
      <SectionTint />
      {/* Single, site-wide particle atmosphere. Per-section ParticleField
          instances were retired in favour of this one — it reads each
          section's profile and blends the envelope smoothly across them. */}
      <GlobalParticleField />
      <Grain opacity={0.04} />

      <Cursor />
      <CursorTrail />

      <AnimatePresence>
        {!ready && <Loader key="loader" onComplete={() => setReady(true)} />}
      </AnimatePresence>

      <Navbar show={ready} />
      {ready && <ScrollProgress />}
      <ConciergeChat show={ready} />

      <main>
        <Hero ready={ready} />
        <Difference />
        <Marquee
          items={["TSC ENGLISH ACADEMY", "海外講師 × 通訳者", "ANYTIME · ANYWHERE", "話す力を、確かに", "ONLINE LESSONS"]}
        />
        <Features />
        <Showcase />
        <ConfidenceCapsule />
        <Pricing />
        <Faq />
        <Apply />
        <Footer />
      </main>
    </LangProvider>
  );
}
