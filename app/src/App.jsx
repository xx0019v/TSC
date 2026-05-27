import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Scene from "./three/Scene";
import Cursor from "./components/Cursor";
import CursorTrail from "./components/CursorTrail";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import Hero from "./sections/Hero";
import Difference from "./sections/Difference";
import Features from "./sections/Features";
import Showcase from "./sections/Showcase";
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
      <div className="fixed inset-0 -z-10">
        <Scene />
      </div>

      <Cursor />
      <CursorTrail />

      <AnimatePresence>
        {!ready && <Loader key="loader" onComplete={() => setReady(true)} />}
      </AnimatePresence>

      <Navbar show={ready} />

      <main>
        <Hero ready={ready} />
        <Difference />
        <Features />
        <Showcase />
        <Pricing />
        <Faq />
        <Apply />
        <Footer />
      </main>
    </LangProvider>
  );
}
