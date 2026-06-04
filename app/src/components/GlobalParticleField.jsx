import { useEffect, useRef } from "react";
import { prefersReduced, isMobile } from "../lib/env";
import { PROFILES, DEFAULT_PROFILE, SECTION_IDS } from "../lib/particleScheme";

/**
 * GlobalParticleField — a single fixed canvas that handles the particle
 * atmosphere across the entire site. Replaces per-section ParticleField
 * instances so we run one RAF, one pool, one allocation budget.
 *
 * Each frame:
 *   1. Compute a target envelope by weighting each section's profile by
 *      its viewport overlap.
 *   2. LERP the live envelope toward the target (no jumps when scrolling).
 *   3. Update + draw particles with the live envelope.
 *   4. Apply a destination-out radial mask to fade particles in the centre
 *      so headlines stay crisp — strength controlled by envelope.centerDim.
 *
 * Sits behind content at zIndex: -5 (in front of the marble ScrollFrames at
 * -10, behind everything else). pointer-events: none.
 */

const MAX_DESKTOP = 800;
const MAX_MOBILE = 350;
const MIN_FPS = 40;
const COL_BASE = ["216,184,106", "252,233,184", "245,242,234"]; // gold / bright / ivory
const BUCKETS = 12;

export default function GlobalParticleField() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    // ── Sizing & DPR ───────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = window.innerWidth;
    let h = window.innerHeight;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ── Particle pool ─────────────────────────────────────────────────
    // Layout per particle: [x, y, vx, vy, hue, size]
    let N = isMobile ? MAX_MOBILE : MAX_DESKTOP;
    const P = new Float32Array(N * 6);
    for (let i = 0; i < N; i++) {
      const off = i * 6;
      P[off + 0] = Math.random() * w;
      P[off + 1] = Math.random() * h;
      P[off + 2] = (Math.random() - 0.5) * 0.15;
      P[off + 3] = (Math.random() - 0.5) * 0.15;
      const hRoll = Math.random();
      P[off + 4] = hRoll < 0.08 ? 1 : hRoll < 0.1 ? 2 : 0;
      // Power-law size — most particles small, a few larger for depth.
      const sRoll = Math.pow(Math.random(), 1.8);
      P[off + 5] = 0.4 + sRoll * 1.8;
    }

    // ── Alpha-bucketed colour cache (3 hues × 13 buckets = 39 strings) ─
    const COL_CACHE = COL_BASE.map((rgb) => {
      const out = new Array(BUCKETS + 1);
      for (let b = 0; b <= BUCKETS; b++) {
        out[b] = `rgba(${rgb},${(b / BUCKETS).toFixed(3)})`;
      }
      return out;
    });

    // ── Live envelope + scroll/mouse state ────────────────────────────
    const env = { ...DEFAULT_PROFILE };
    const state = { mouseX: -9999, mouseY: -9999, scrollVy: 0, lastScrollY: window.scrollY };

    // Section element cache — refreshed periodically in case of DOM churn.
    let sectionEls = SECTION_IDS.map((id) => ({ id, el: document.getElementById(id) }));
    const refreshEls = () => {
      sectionEls = SECTION_IDS.map((id) => ({ id, el: document.getElementById(id) }));
    };

    /** Weighted blend of visible sections' profiles. */
    const computeTarget = () => {
      const vh = h;
      let totalWeight = 0;
      let dens = 0, bri = 0, siz = 0, dim = 0, dri = 0;
      for (const { id, el } of sectionEls) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const overlap = Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top));
        if (overlap < 1) continue;
        const weight = overlap / vh;
        const p = PROFILES[id] || DEFAULT_PROFILE;
        totalWeight += weight;
        dens += p.density * weight;
        bri += p.brightness * weight;
        siz += p.size * weight;
        dim += p.centerDim * weight;
        dri += p.drift * weight;
      }
      if (totalWeight > 0) {
        return {
          density: dens / totalWeight,
          brightness: bri / totalWeight,
          size: siz / totalWeight,
          centerDim: dim / totalWeight,
          drift: dri / totalWeight,
        };
      }
      return DEFAULT_PROFILE;
    };

    // ── Listeners ─────────────────────────────────────────────────────
    let lastActivity = performance.now();
    const onMove = (e) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      lastActivity = performance.now();
    };
    const onLeave = () => { state.mouseX = -9999; state.mouseY = -9999; };
    const onScroll = () => {
      const y = window.scrollY;
      state.scrollVy = y - state.lastScrollY;
      state.lastScrollY = y;
      lastActivity = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);
    const onVis = () => { if (!document.hidden) lastActivity = performance.now(); };
    document.addEventListener("visibilitychange", onVis);

    // Celebration burst — listens for the Konami egg event and lifts the
    // brightness for a short window.
    let celebrateUntil = 0;
    const onCelebrate = (e) => {
      const dur = (e?.detail?.duration) || 4000;
      celebrateUntil = performance.now() + dur;
      lastActivity = performance.now();
    };
    window.addEventListener("tsc-celebrate", onCelebrate);

    // ── Animation loop ────────────────────────────────────────────────
    const damp = 0.93; // slow, graceful damping
    const mRad2 = 120 * 120;
    let raf;
    let frameCount = 0;
    let fpsStart = 0;
    let fpsCheckDone = false;
    let lastTickTime = 0;
    // When the user hasn't interacted for ~2.5s, cap drawing at ~30fps
    // (still smooth for slow drift, half the CPU). 60fps the moment they
    // move again.
    const IDLE_FRAME_MS = 1000 / 30;

    const tick = (t) => {
      if (document.hidden) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const idle = (t - lastActivity) > 2500;
      if (idle && (t - lastTickTime) < IDLE_FRAME_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastTickTime = t;
      // First-2-seconds FPS sample → halve the pool on slow devices.
      if (!fpsCheckDone) {
        if (fpsStart === 0) fpsStart = t;
        frameCount++;
        if (t - fpsStart > 2000) {
          const fps = (frameCount * 1000) / (t - fpsStart);
          if (fps < MIN_FPS) N = Math.max(150, Math.round(N * 0.55));
          fpsCheckDone = true;
        }
      } else {
        frameCount++;
      }

      // Refresh section element cache every ~60 frames (cheap).
      if ((frameCount & 63) === 0) refreshEls();

      // Blend envelope toward target.
      const target = computeTarget();
      env.density += (target.density - env.density) * 0.06;
      env.brightness += (target.brightness - env.brightness) * 0.06;
      env.size += (target.size - env.size) * 0.06;
      env.centerDim += (target.centerDim - env.centerDim) * 0.06;
      env.drift += (target.drift - env.drift) * 0.06;

      // While celebrating, scale density + brightness up briefly.
      const celebrating = t < celebrateUntil;
      const celebrateBoost = celebrating
        ? 1 + Math.max(0, Math.min(1, (celebrateUntil - t) / 4000)) * 0.6
        : 1;
      const visN = Math.max(0, Math.min(N, Math.round(N * env.density * celebrateBoost)));
      const aBucket = Math.max(0, Math.min(BUCKETS, Math.round(env.brightness * celebrateBoost * BUCKETS)));

      // Scroll velocity decays slowly so the downward "fall" lingers.
      const sVy = state.scrollVy;
      state.scrollVy *= 0.94;
      const driftK = env.drift;
      const envSize = env.size;
      const mx = state.mouseX;
      const my = state.mouseY;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      // Group draws by hue → 3 fillStyle ops per frame instead of visN.
      for (let g = 0; g < 3; g++) {
        ctx.fillStyle = COL_CACHE[g][aBucket];
        for (let i = 0; i < visN; i++) {
          const o = i * 6;
          if ((P[o + 4] | 0) !== g) continue;

          let x = P[o], y = P[o + 1];
          let vx = P[o + 2], vy = P[o + 3];

          // Gentle organic perturbation
          vx += (Math.random() - 0.5) * 0.025;
          vy += (Math.random() - 0.5) * 0.025;
          // Scroll drag
          vy += sVy * driftK * 0.06;
          // Damping
          vx *= damp;
          vy *= damp;
          // Mouse repulsion
          const dx = x - mx, dy = y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < mRad2 && d2 > 1) {
            const f = (1 - d2 / mRad2) * 1.2;
            const inv = 1 / Math.sqrt(d2);
            vx += dx * inv * f;
            vy += dy * inv * f;
          }
          x += vx;
          y += vy;
          // Toroidal wrap — never run out of particles at the edges.
          if (x < -8) x = w + 8;
          else if (x > w + 8) x = -8;
          if (y < -8) y = h + 8;
          else if (y > h + 8) y = -8;

          P[o] = x;
          P[o + 1] = y;
          P[o + 2] = vx;
          P[o + 3] = vy;

          const r = P[o + 5] * envSize;
          ctx.fillRect(x - r * 0.5, y - r * 0.5, r, r);
        }
      }

      // Centre exclusion zone — gently erase particles in the centre ellipse
      // so the headline / centre copy stays unambiguously readable.
      const dim = env.centerDim;
      if (dim > 0.02) {
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.5;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(0,0,0,${dim.toFixed(3)})`);
        grad.addColorStop(0.55, `rgba(0,0,0,${(dim * 0.5).toFixed(3)})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(tick);
    };

    if (prefersReduced) {
      // Static snapshot, mid brightness, half pool — no animation.
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (let g = 0; g < 3; g++) {
        ctx.fillStyle = COL_CACHE[g][6];
        for (let i = 0; i < N / 2; i++) {
          const o = i * 6;
          if ((P[o + 4] | 0) !== g) continue;
          const r = P[o + 5];
          ctx.fillRect(P[o] - r / 2, P[o + 1] - r / 2, r, r);
        }
      }
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("tsc-celebrate", onCelebrate);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -5 }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
