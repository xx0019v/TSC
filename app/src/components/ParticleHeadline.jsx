import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { prefersReduced, isMobile } from "../lib/env";

/**
 * ParticleHeadline — a large heading whose letters dissolve into a small
 * cloud of gold dust only where the cursor touches them, then heal back
 * into letter form as the cursor moves away. No decoration is added when
 * idle: the typography looks unchanged.
 *
 * How the dissolution works:
 *
 *   1) Each line of text wears a CSS radial mask centred on the cursor
 *      position (tracked via the --cx / --cy custom properties). Inside
 *      ~38px the text goes fully transparent; from 38–105px it fades to
 *      fully opaque. Outside that radius the text reads normally.
 *
 *   2) A canvas sampled at the rendered letter pixels carries one particle
 *      per sample. A particle is invisible (alpha 0) until the cursor
 *      enters its radius; then its alpha rises with proximity AND it is
 *      pushed outward by the same proximity force. The result: where the
 *      text vanishes, particles appear and drift outward — never a duplicate
 *      decoration on top of legible letters.
 *
 *   3) Particles spring back to their original letter pixel when the
 *      cursor leaves and fade to invisible — the letter heals.
 *
 * Accessibility: text remains real HTML, selectable, readable by screen
 * readers, indexable. Mobile and prefers-reduced-motion skip the canvas
 * and mask entirely — the typography is just rendered normally.
 */

const MASK_GRADIENT =
  "radial-gradient(circle 110px at var(--cx, -9999px) var(--cy, -9999px), transparent 0%, transparent 32%, black 96%)";

// Alpha-bucketed colour cache — avoids ~N string allocations per frame.
const COL_BASE = ["216,184,106", "252,233,184", "245,242,234"]; // gold / bright / ivory
const A_BUCKETS = 16;

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
  const [phase, setPhase] = useState("hidden"); // hidden | reveal | live

  // ── Reveal phasing ─────────────────────────────────────────────────
  useEffect(() => {
    if (!play) return;
    setPhase("reveal");
    const totalMs = (delay + (lines.length - 1) * 0.12 + 0.85 + 0.15) * 1000;
    const t = setTimeout(() => setPhase("live"), totalMs);
    return () => clearTimeout(t);
  }, [play, delay, lines.length]);

  // ── Particle dissolution system ───────────────────────────────────
  useEffect(() => {
    if (phase !== "live") return;
    if (prefersReduced || isMobile) return; // typography only on these targets
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const ctx = canvas.getContext("2d", { alpha: true });

    // Pre-build colour strings indexed by [hue][alphaBucket].
    const COL_CACHE = COL_BASE.map((rgb) => {
      const arr = new Array(A_BUCKETS + 1);
      for (let b = 0; b <= A_BUCKETS; b++) {
        arr[b] = `rgba(${rgb},${(b / A_BUCKETS).toFixed(3)})`;
      }
      return arr;
    });

    let w = 0, h = 0;
    let P = null;
    let N = 0;

    /** Sample rendered letter pixels into a point cloud. */
    const sample = () => {
      const wrapRect = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(wrapRect.width));
      h = Math.max(1, Math.round(wrapRect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const offCtx = off.getContext("2d");
      offCtx.fillStyle = "#fff";

      // Track each line's vertical band so particles inherit the line's
      // base colour weighting (gold for the goldLine, ivory otherwise).
      const bands = [];
      lineRefs.current.forEach((lineEl, idx) => {
        if (!lineEl) return;
        const lr = lineEl.getBoundingClientRect();
        const cs = getComputedStyle(lineEl);
        offCtx.font = `${cs.fontStyle || "normal"} ${cs.fontWeight || "400"} ${cs.fontSize} ${cs.fontFamily}`;
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
        bands.push({ top: localTop, bottom: localTop + lr.height, isGold: idx === goldLine });
      });

      const data = offCtx.getImageData(0, 0, w, h).data;
      const stride = 3;
      const pts = [];
      for (let y = 0; y < h; y += stride) {
        for (let x = 0; x < w; x += stride) {
          if (data[(y * w + x) * 4 + 3] > 80) {
            const band = bands.find((b) => y >= b.top - 4 && y <= b.bottom + 4);
            pts.push([x, y, band ? band.isGold : false]);
          }
        }
      }
      return pts;
    };

    const init = () => {
      const pts = sample();
      if (!pts.length) return false;
      // Shuffle so identical-target particles don't stack in lines.
      for (let i = pts.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const tmp = pts[i]; pts[i] = pts[j]; pts[j] = tmp;
      }
      // Pool size — particles are mostly invisible (only those near cursor draw).
      const cap = 1400;
      N = Math.min(cap, pts.length);
      // Layout: [x, y, vx, vy, tx, ty, size, hue]
      P = new Float32Array(N * 8);
      for (let i = 0; i < N; i++) {
        const o = i * 8;
        const p = pts[i % pts.length];
        P[o + 0] = p[0];
        P[o + 1] = p[1];
        P[o + 2] = 0;
        P[o + 3] = 0;
        P[o + 4] = p[0];
        P[o + 5] = p[1];
        P[o + 6] = 0.6 + Math.pow(Math.random(), 1.5) * 1.0; // 0.6..1.6
        // Hue chosen from the line's colour palette.
        const isGold = p[2];
        const roll = Math.random();
        if (isGold) {
          P[o + 7] = roll < 0.85 ? 0 : roll < 0.96 ? 1 : 2; // mostly gold
        } else {
          P[o + 7] = roll < 0.86 ? 2 : roll < 0.96 ? 0 : 1; // mostly ivory
        }
      }
      return true;
    };

    if (!init()) return;

    // ── Cursor + visibility state ────────────────────────────────────
    let mx = -9999, my = -9999;
    let visible = true;
    let raf;

    const updateMaskPositions = () => {
      lineRefs.current.forEach((line) => {
        if (!line) return;
        const r = line.getBoundingClientRect();
        line.style.setProperty("--cx", `${mx - r.left}px`);
        line.style.setProperty("--cy", `${my - r.top}px`);
      });
    };

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      updateMaskPositions();
    };
    const onScroll = () => updateMaskPositions();
    const onResize = () => { init(); };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0 });
    io.observe(wrap);

    // ── Animation loop ────────────────────────────────────────────────
    const rIn = 36;             // mask fully transparent inside this radius
    const rOut = 106;            // mask fully opaque outside this radius
    const rOut2 = rOut * rOut;
    const range = rOut - rIn;
    let wasIdle = true;          // whether last frame had no cursor influence
    let stillFrames = 0;         // frames since any activity; lets us early-out

    const tick = () => {
      if (!visible) {
        // Off-screen — keep RAF alive but skip everything.
        raf = requestAnimationFrame(tick);
        return;
      }

      const wrapRect = wrap.getBoundingClientRect();
      const cx = mx - wrapRect.left;
      const cy = my - wrapRect.top;
      // If cursor is far outside the wrapper, no particle will be in range —
      // count stillFrames; after 6 idle frames we can skip drawing entirely.
      const padded = rOut + 4;
      const cursorOutside =
        cx < -padded || cy < -padded || cx > w + padded || cy > h + padded;

      if (cursorOutside) {
        if (stillFrames < 6) {
          // Still draining residual particle velocities — keep stepping.
        } else {
          // Truly idle: just clear if needed and skip work.
          if (!wasIdle) {
            ctx.clearRect(0, 0, w, h);
            wasIdle = true;
          }
          raf = requestAnimationFrame(tick);
          return;
        }
      }
      wasIdle = false;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      let anyActive = false;

      for (let i = 0; i < N; i++) {
        const o = i * 8;
        const tx = P[o + 4];
        const ty = P[o + 5];
        const dx = cx - tx;
        const dy = cy - ty;
        const d2 = dx * dx + dy * dy;

        let alpha = 0;
        let targetX = tx;
        let targetY = ty;

        if (d2 < rOut2) {
          const d = Math.sqrt(d2);
          alpha = d < rIn ? 1 : (rOut - d) / range;
          // Push away from cursor proportional to proximity force.
          if (d > 0.5) {
            const push = alpha * 38;
            targetX = tx - (dx / d) * push;
            targetY = ty - (dy / d) * push;
          }
        }

        // Spring toward target (base or displaced)
        let x = P[o], y = P[o + 1];
        let vx = P[o + 2], vy = P[o + 3];
        vx += (targetX - x) * 0.085;
        vy += (targetY - y) * 0.085;
        vx *= 0.82;
        vy *= 0.82;
        x += vx;
        y += vy;
        P[o] = x;
        P[o + 1] = y;
        P[o + 2] = vx;
        P[o + 3] = vy;

        if (alpha > 0.04) {
          anyActive = true;
          const b = (alpha * A_BUCKETS) | 0;
          ctx.fillStyle = COL_CACHE[P[o + 7] | 0][b > A_BUCKETS ? A_BUCKETS : b];
          const r = P[o + 6];
          ctx.fillRect(x - r * 0.5, y - r * 0.5, r, r);
        }
      }

      stillFrames = anyActive ? 0 : stillFrames + 1;

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, [phase, goldLine]);

  const Wrapper = as;
  const enabled = !prefersReduced && !isMobile;

  const maskStyle = enabled
    ? {
        WebkitMaskImage: MASK_GRADIENT,
        maskImage: MASK_GRADIENT,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }
    : undefined;

  return (
    <Wrapper ref={wrapRef} className={`relative ${className}`}>
      {lines.map((line, i) => (
        <motion.span
          key={`${i}-${line}`}
          ref={(el) => (lineRefs.current[i] = el)}
          className={`block ${i === goldLine ? "text-gold" : "text-ivory"}`}
          style={maskStyle}
          initial={{ opacity: 0, y: 16 }}
          animate={phase !== "hidden" ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.12 }}
        >
          {line}
        </motion.span>
      ))}
      {enabled && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute left-0 top-0"
          aria-hidden="true"
        />
      )}
    </Wrapper>
  );
}
