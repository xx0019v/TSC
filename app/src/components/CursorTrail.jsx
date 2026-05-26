import { useEffect, useRef } from "react";
import { isTouch, prefersReduced } from "../lib/env";

/**
 * Gold "living light" dust that trails the cursor (teamLab-style).
 * Additive particles spawned along pointer movement; fade + drift upward.
 * Disabled on touch / reduced-motion. Pointer-events: none.
 */
export default function CursorTrail() {
  const ref = useRef(null);

  useEffect(() => {
    if (isTouch || prefersReduced) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // pre-rendered gold glow sprite
    const sp = document.createElement("canvas");
    sp.width = sp.height = 48;
    const sx = sp.getContext("2d");
    const g = sx.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, "rgba(255,240,200,0.95)");
    g.addColorStop(0.3, "rgba(244,215,130,0.5)");
    g.addColorStop(1, "rgba(212,175,55,0)");
    sx.fillStyle = g;
    sx.fillRect(0, 0, 48, 48);

    const parts = [];
    let mx = -999, my = -999, pmx = -999, pmy = -999, moved = false;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; moved = true; };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf;
    function tick() {
      raf = requestAnimationFrame(tick);

      if (moved) {
        if (pmx < -900) { pmx = mx; pmy = my; }
        const dx = mx - pmx, dy = my - pmy;
        const dist = Math.hypot(dx, dy);
        const n = Math.min(7, Math.floor(dist / 5) + 1);
        for (let i = 0; i < n && parts.length < 180; i++) {
          const t = i / n;
          parts.push({
            x: pmx + dx * t + (Math.random() - 0.5) * 6,
            y: pmy + dy * t + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.6 - 0.35,
            life: 1,
            size: 5 + Math.random() * 11,
          });
        }
        pmx = mx; pmy = my; moved = false;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.004;
        p.life -= 0.022;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = p.life * 0.7;
        const s = p.size * (0.5 + p.life * 0.6);
        ctx.drawImage(sp, p.x - s / 2, p.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  if (isTouch || prefersReduced) return null;
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[55]" aria-hidden="true" />;
}
