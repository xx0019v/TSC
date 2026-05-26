import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { fx } from "./store";
import { prefersReduced } from "./env";

/**
 * Sets up Lenis smooth scrolling, syncs it to the GSAP ticker + ScrollTrigger,
 * and feeds normalized scroll progress into the shared `fx` store.
 * Pass `paused` to lock scrolling (e.g. during the loader).
 */
export default function useLenis(paused) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (prefersReduced) return; // native scroll, no smoothing

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ({ scroll, limit }) => {
      fx.scroll = limit > 0 ? scroll / limit : 0;
      ScrollTrigger.update();
    });

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (paused) lenis.stop();
    else lenis.start();
  }, [paused]);
}
