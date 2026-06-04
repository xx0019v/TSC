import { useEffect, useRef } from "react";
import { prefersReduced } from "../lib/env";

/**
 * Animated film-grain overlay. A small noise tile is regenerated a few times
 * per second and tiled across the viewport at low opacity, lending the whole
 * page the analog warmth of high-end JP editorial sites (emberz / spiral-cap).
 *
 * Lives above the ScrollFrames canvas but below content/cursor.
 */
export default function Grain({ opacity = 0.07, fps = 14 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;
    const size = 140;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d", { alpha: true });
    let raf;
    let last = 0;
    const step = (t) => {
      if (document.hidden) {
        raf = requestAnimationFrame(step);
        return;
      }
      if (t - last > 1000 / fps) {
        last = t;
        const img = ctx.createImageData(size, size);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = (Math.random() * 255) | 0;
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
          d[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
        el.style.backgroundImage = `url(${c.toDataURL("image/png")})`;
      }
      raf = requestAnimationFrame(step);
    };
    el.style.backgroundRepeat = "repeat";
    el.style.backgroundSize = `${size}px ${size}px`;
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [fps]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] mix-blend-overlay"
      style={{ opacity }}
    />
  );
}
