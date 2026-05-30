import { useEffect, useRef } from "react";
import { prefersReduced } from "../lib/env";

/**
 * Soft gold spotlight that follows the cursor — a low-opacity radial gradient
 * rendered into a fixed, blurred div. Adds the "luxe glow" of spiral-cap /
 * emberz without competing with the ScrollFrames background.
 */
export default function AuroraSpotlight() {
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    let raf;
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.transform = `translate3d(${x - 320}px, ${y - 320}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[4] h-[640px] w-[640px] rounded-full will-change-transform"
      style={{
        background:
          "radial-gradient(circle, rgba(252,233,184,0.18), rgba(216,184,106,0.08) 35%, transparent 70%)",
        filter: "blur(40px)",
        mixBlendMode: "screen",
      }}
    />
  );
}
