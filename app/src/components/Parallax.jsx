import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { prefersReduced } from "../lib/env";

/**
 * Scroll-driven vertical parallax. Wrap an element (e.g. an image) and it
 * drifts as the section scrolls through the viewport. `speed` = fraction of
 * its own height to travel (positive = moves up faster).
 */
export default function Parallax({ children, speed = 0.16, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReduced || !ref.current) return;
    const el = ref.current;
    const tween = gsap.fromTo(
      el,
      { yPercent: speed * 60 },
      {
        yPercent: -speed * 60,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement || el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
