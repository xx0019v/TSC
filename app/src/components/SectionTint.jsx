import { useEffect, useRef } from "react";
import { PROFILES, SECTION_IDS } from "../lib/particleScheme";

/**
 * SectionTint — a full-viewport colour overlay whose tint is blended from
 * the currently visible sections' profiles (PROFILES[id].tint). Sits behind
 * the content (zIndex: -7), in front of the marble ScrollFrames and the
 * GlobalParticleField, so the whole scene takes on each section's "lighting".
 *
 * The blend mirrors GlobalParticleField's logic — overlap-weighted average,
 * LERPed at 0.07 per frame for smooth transitions. RGB channels carry the
 * hue; alpha carries the strength.
 */
export default function SectionTint() {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    // Live envelope (blended target).
    const env = { r: 5, g: 6, b: 10, a: 0 };
    let sectionEls = SECTION_IDS.map((id) => ({ id, el: document.getElementById(id) }));
    const refreshEls = () => {
      sectionEls = SECTION_IDS.map((id) => ({ id, el: document.getElementById(id) }));
    };

    const computeTarget = () => {
      const vh = window.innerHeight;
      let totalWeight = 0;
      let r = 0, g = 0, b = 0, a = 0;
      for (const { id, el } of sectionEls) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const overlap = Math.max(0, Math.min(vh, rect.bottom) - Math.max(0, rect.top));
        if (overlap < 1) continue;
        const weight = overlap / vh;
        const tint = (PROFILES[id] && PROFILES[id].tint) || [5, 6, 10, 0];
        totalWeight += weight;
        r += tint[0] * weight;
        g += tint[1] * weight;
        b += tint[2] * weight;
        a += tint[3] * weight;
      }
      if (totalWeight > 0) {
        r /= totalWeight; g /= totalWeight; b /= totalWeight; a /= totalWeight;
      }
      return { r, g, b, a };
    };

    let raf;
    let frame = 0;
    let lastTickTime = 0;
    let lastScrollY = window.scrollY;
    let lastActivity = performance.now();
    const onScroll = () => { lastActivity = performance.now(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    const onVis = () => { if (!document.hidden) { lastActivity = performance.now(); } };
    document.addEventListener("visibilitychange", onVis);

    const IDLE_FRAME_MS = 1000 / 30; // 30fps when nothing has happened recently

    const tick = (t) => {
      if (document.hidden) {
        raf = requestAnimationFrame(tick);
        return;
      }
      // Adaptive FPS: while idle, run at 30fps. The colour LERP is slow
      // enough that visitors can't see a difference, but it halves the
      // section-rect reads + style writes.
      const idle = (t - lastActivity) > 2000;
      if (idle && (t - lastTickTime) < IDLE_FRAME_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastTickTime = t;

      if ((frame & 31) === 0) refreshEls();
      frame++;
      const target = computeTarget();
      env.r += (target.r - env.r) * 0.07;
      env.g += (target.g - env.g) * 0.07;
      env.b += (target.b - env.b) * 0.07;
      env.a += (target.a - env.a) * 0.07;
      layer.style.backgroundColor = `rgba(${env.r | 0},${env.g | 0},${env.b | 0},${env.a.toFixed(3)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -7, transition: "background-color 0ms" }}
    />
  );
}
