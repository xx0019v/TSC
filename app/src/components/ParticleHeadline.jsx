import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { prefersReduced, isMobile } from "../lib/env";

/**
 * ParticleHeadline — a large heading whose letterforms are dusted with gold
 * particles that spring back to letter positions and gently repel from the
 * cursor.
 *
 * The text is rendered as real HTML so it stays readable, selectable,
 * accessible to screen readers, and indexable by search engines. A canvas
 * overlay in `mix-blend: screen` mode samples the rendered text and adds
 * gold sparkle on top — additive only, never replacing the letters.
 *
 * Phasing:
 *   hidden → reveal (per-line opacity stagger) → live (canvas comes up,
 *   particles spring to sampled letter positions, mouse interaction starts).
 *
 * Performance budget: ≤850 particles desktop / ≤350 mobile, one canvas,
 * one RAF, additive single-pass draw, prefers-reduced-motion → static.
 */
export default function ParticleHeadline({
  as = "h1",
  lines = [],
  goldLine = -1,
  play = true,
  delay = 0,
  className = "",
}) {
  const wrapRef = useRef(null);
  const lineRefs = useRef([]);
  const canvasRef = useRef(null);
  const [phase, setPhase] = useState("hidden"); // 'hidden' | 'reveal' | 'live'

  // ── Reveal phasing ─────────────────────────────────────────────────
  useEffect(() => {
    if (!play) return;
    setPhase("reveal");
    // Total reveal duration: first-line start + last-line stagger + line duration + a 150ms settle.
    const totalMs = (delay + (lines.length - 1) * 0.12 + 0.85 + 0.15) * 1000;
    const t = setTimeout(() => setPhase("live"), totalMs);
    return () => clearTimeout(t);
  }, [play, delay, lines.length]);

  // ── Particle system, mounts once phase becomes 'live' ─────────────
  useEffect(() => {
    if (phase !== "live" || prefersReduced) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const ctx = canvas.getContext("2d", { alpha: true });

    // Sample the rendered text by drawing each line to an offscreen canvas
    // at its actual computed font/size/position, then scanning the alpha.
    const buildPoints = () => {
      const wrapRect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.round(wrapRect.width));
      const h = Math.max(1, Math.round(wrapRect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const offCtx = off.getContext("2d");
      offCtx.clearRect(0, 0, w, h);
      offCtx.fillStyle = "#fff";

      lineRefs.current.forEach((lineEl) => {
        if (!lineEl) return;
        const lr = lineEl.getBoundingClientRect();
        const cs = getComputedStyle(lineEl);
        const fontStyle = cs.fontStyle || "normal";
        const fontWeight = cs.fontWeight || "400";
        offCtx.font = `${fontStyle} ${fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        offCtx.textBaseline = "top";
        const align = cs.textAlign;
        offCtx.textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";
        const localLeft = lr.left - wrapRect.left;
        const localTop = lr.top - wrapRect.top;
        const textX = align === "center"
          ? localLeft + lr.width / 2
          : align === "right"
          ? localLeft + lr.width
          : localLeft;
        offCtx.fillText(lineEl.textContent, textX, localTop);
      });

      const data = offCtx.getImageData(0, 0, w, h).data;
      const stride = isMobile ? 5 : 3;
      const pts = [];
      for (let y = 0; y < h; y += stride) {
        for (let x = 0; x < w; x += stride) {
          if (data[(y * w + x) * 4 + 3] > 80) pts.push([x, y]);
        }
      }
      return { w, h, pts };
    };

    const init = () => {
      const { w, h, pts } = buildPoints();
      if (!pts.length) return null;
      // Shuffle so identical-target particles don't stack in obvious rows.
      for (let i = pts.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const tmp = pts[i]; pts[i] = pts[j]; pts[j] = tmp;
      }
      const cap = isMobile ? 350 : 850;
      const N = Math.min(cap, pts.length);
      // Layout per particle: [x, y, vx, vy, tx, ty, size, hue].
      const P = new Float32Array(N * 8);
      for (let i = 0; i < N; i++) {
        const o = i * 8;
        const p = pts[i % pts.length];
        // Start near letter position so the headline reads instantly —
        // particles settle in within a frame or two.
        P[o + 0] = p[0] + (Math.random() - 0.5) * 8;
        P[o + 1] = p[1] + (Math.random() - 0.5) * 8;
        P[o + 2] = 0;
        P[o + 3] = 0;
        P[o + 4] = p[0];
        P[o + 5] = p[1];
        // Power-law: most small, few larger (depth + sparkle).
        P[o + 6] = 0.45 + Math.pow(Math.random(), 1.8) * 1.2;
        const hRoll = Math.random();
        P[o + 7] = hRoll < 0.15 ? 1 : hRoll < 0.20 ? 2 : 0;
      }
      return { w, h, P, N };
    };

    let state = init();
    if (!state) return;

    let raf;
    let mx = -9999, my = -9999;

    // Quieter alphas than the background field — these particles sit ON the
    // letters, where they need to enhance not overwhelm.
    const COL = [
      "rgba(216,184,106,0.78)",  // gold
      "rgba(252,233,184,0.90)",  // gold-bright
      "rgba(245,242,234,0.65)",  // ivory
    ];

    const tick = () => {
      const { w, h, P, N } = state;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const wrapRect = wrap.getBoundingClientRect();
      const localMx = mx - wrapRect.left;
      const localMy = my - wrapRect.top;
      const mRad2 = 110 * 110;
      const idle = mx < -1000 ||
        localMx < -50 || localMx > w + 50 ||
        localMy < -50 || localMy > h + 50;

      for (let g = 0; g < 3; g++) {
        ctx.fillStyle = COL[g];
        for (let i = 0; i < N; i++) {
          const o = i * 8;
          if ((P[o + 7] | 0) !== g) continue;
          let x = P[o], y = P[o + 1];
          let vx = P[o + 2], vy = P[o + 3];
          const tx = P[o + 4], ty = P[o + 5];

          // Spring to letter position
          vx += (tx - x) * 0.055;
          vy += (ty - y) * 0.055;
          // Idle wobble (breathing) when cursor far; repulsion when near
          if (idle) {
            vx += (Math.random() - 0.5) * 0.06;
            vy += (Math.random() - 0.5) * 0.06;
          } else {
            const dx = x - localMx, dy = y - localMy;
            const d2 = dx * dx + dy * dy;
            if (d2 < mRad2 && d2 > 1) {
              const f = (1 - d2 / mRad2) * 2.2;
              const inv = 1 / Math.sqrt(d2);
              vx += dx * inv * f;
              vy += dy * inv * f;
            }
          }
          // Damping
          vx *= 0.88;
          vy *= 0.88;
          x += vx;
          y += vy;
          P[o] = x;
          P[o + 1] = y;
          P[o + 2] = vx;
          P[o + 3] = vy;

          const r = P[o + 6];
          ctx.fillRect(x - r * 0.5, y - r * 0.5, r, r);
        }
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const onLeave = () => { mx = -9999; my = -9999; };
    const onResize = () => {
      const next = init();
      if (next) state = next;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("resize", onResize);

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [phase]);

  const Wrapper = as;

  return (
    <Wrapper ref={wrapRef} className={`relative ${className}`}>
      {lines.map((line, i) => (
        <motion.span
          key={`${i}-${line}`}
          ref={(el) => (lineRefs.current[i] = el)}
          className={`block ${i === goldLine ? "text-gold" : "text-ivory"}`}
          initial={{ opacity: 0, y: 16 }}
          animate={phase !== "hidden" ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.12 }}
        >
          {line}
        </motion.span>
      ))}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute left-0 top-0"
        style={{ mixBlendMode: "screen" }}
        aria-hidden="true"
      />
    </Wrapper>
  );
}
