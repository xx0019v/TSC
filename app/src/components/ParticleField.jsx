import { useEffect, useRef } from "react";
import { prefersReduced, isMobile } from "../lib/env";

/**
 * Canvas-2D particle field that morphs between target shapes.
 *
 * Each target is rendered once to an offscreen canvas, the bright pixels are
 * sampled into a point cloud, and every particle is given a (tx, ty) on that
 * cloud. Particles spring toward their target with light damping; once they
 * settle, the field holds for `hold` ms, then advances to the next target.
 *
 * Performance budget: ≤3000 particles desktop / ≤1200 mobile, additive
 * blending in a single canvas layer, RAF gated by IntersectionObserver.
 *
 * Props
 * ─────
 *  targets       Array of { type: 'text' | 'image' | 'drift', text?, src?, hold?, fontSize?, fontFamily? }
 *  density       Particle count override (default: device-aware)
 *  mouseRadius   Pointer push radius in px (default 110)
 *  scrollDrift   How much scroll velocity drags particles vertically (default 0.04)
 *  loopTargets   Cycle back to target 0 after the last one (default true)
 *  onCycleEnd    Called once when the last target has been *held* (only used when loopTargets=false)
 *  className     Extra classes on the wrapper
 */
export default function ParticleField({
  targets,
  density,
  mouseRadius = 110,
  scrollDrift = 0.10,
  loopTargets = true,
  onCycleEnd,
  className = "",
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({ visible: true, scrollVy: 0, lastScrollY: 0, mouseX: -9999, mouseY: -9999 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    // ── Setup ────────────────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0, h = 0;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Particle count — scales with size and device.
    const baseCap = isMobile ? 900 : 3000;
    const sizeCap = Math.round((w * h) / 900); // ~one particle per 30px square
    const N = Math.max(400, Math.min(density || baseCap, sizeCap, baseCap));

    // Particles live in a flat Float32Array for cache-friendly iteration.
    // Layout: [x, y, vx, vy, tx, ty, hue, size] per particle.
    const P = new Float32Array(N * 8);
    for (let i = 0; i < N; i++) {
      const off = i * 8;
      P[off + 0] = Math.random() * w;        // x
      P[off + 1] = Math.random() * h;        // y
      P[off + 2] = (Math.random() - 0.5) * 0.3; // vx
      P[off + 3] = (Math.random() - 0.5) * 0.3; // vy
      P[off + 4] = P[off + 0];               // tx
      P[off + 5] = P[off + 1];               // ty
      const roll = Math.random();
      P[off + 6] = roll < 0.08 ? 1 : roll < 0.1 ? 2 : 0; // hue: 0=gold, 1=bright, 2=ivory
      P[off + 7] = 0.6 + Math.random() * 1.2; // size px
    }

    // Pre-computed opaque colour strings — avoids string concat in the hot loop.
    // Index matches the hue slot stored at P[i*8 + 6].
    const COLORS = [
      "rgba(216,184,106,0.85)",  // gold
      "rgba(252,233,184,0.92)",  // gold-bright
      "rgba(245,242,234,0.78)",  // ivory
    ];
    const COLORS_STATIC = [
      "rgba(216,184,106,0.7)",
      "rgba(252,233,184,0.8)",
      "rgba(245,242,234,0.65)",
    ];

    // ── Target sampling ──────────────────────────────────────────────────
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d");

    /** Sample bright pixels from the offscreen canvas → array of (x,y) in field coords. */
    const samplePoints = (sw, sh, dx, dy, stride = 4, threshold = 30) => {
      const img = offCtx.getImageData(0, 0, sw, sh).data;
      const pts = [];
      for (let y = 0; y < sh; y += stride) {
        for (let x = 0; x < sw; x += stride) {
          const a = img[(y * sw + x) * 4 + 3];
          if (a > threshold) pts.push([x + dx, y + dy]);
        }
      }
      return pts;
    };

    /** Build a point cloud for a target. */
    const buildTarget = async (t) => {
      if (t.type === "drift" || !t.type) {
        // Random scatter across the field with a soft elliptical bias.
        const pts = [];
        for (let i = 0; i < N; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.pow(Math.random(), 0.65);
          pts.push([w / 2 + Math.cos(a) * r * w * 0.45, h / 2 + Math.sin(a) * r * h * 0.42]);
        }
        return pts;
      }
      if (t.type === "text") {
        const fontSize = t.fontSize || Math.min(w * 0.22, h * 0.45, 220);
        const family = t.fontFamily || "'Cormorant Garamond', 'Times New Roman', serif";
        off.width = w;
        off.height = h;
        offCtx.clearRect(0, 0, w, h);
        offCtx.fillStyle = "#fff";
        offCtx.textAlign = "center";
        offCtx.textBaseline = "middle";
        offCtx.font = `${t.weight || 400} ${fontSize}px ${family}`;
        // Multi-line support: split on \n
        const lines = String(t.text).split("\n");
        const lineH = fontSize * 1.05;
        const startY = h / 2 - ((lines.length - 1) * lineH) / 2;
        lines.forEach((line, i) => offCtx.fillText(line, w / 2, startY + i * lineH));
        return samplePoints(w, h, 0, 0, t.stride || 4, 60);
      }
      if (t.type === "image") {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const fit = Math.min((w * 0.55) / img.width, (h * 0.7) / img.height);
            const iw = Math.round(img.width * fit);
            const ih = Math.round(img.height * fit);
            const dx = Math.round((w - iw) / 2);
            const dy = Math.round((h - ih) / 2);
            off.width = w;
            off.height = h;
            offCtx.clearRect(0, 0, w, h);
            offCtx.drawImage(img, dx, dy, iw, ih);
            resolve(samplePoints(w, h, 0, 0, t.stride || 5, 60));
          };
          img.onerror = () => resolve(buildTarget({ type: "drift" }));
          img.src = t.src;
        });
      }
      return buildTarget({ type: "drift" });
    };

    /** Assign tx/ty for every particle from a point cloud (cycles if shorter). */
    const assignTarget = (pts) => {
      if (!pts.length) return;
      // Shuffle particle indices so the morph reads as organic, not a sweep.
      const order = new Uint32Array(N);
      for (let i = 0; i < N; i++) order[i] = i;
      for (let i = N - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        const tmp = order[i]; order[i] = order[j]; order[j] = tmp;
      }
      for (let k = 0; k < N; k++) {
        const p = pts[k % pts.length];
        // Small jitter so identical-target particles don't stack pixel-perfect.
        const jx = (Math.random() - 0.5) * 1.4;
        const jy = (Math.random() - 0.5) * 1.4;
        const off = order[k] * 8;
        P[off + 4] = p[0] + jx;
        P[off + 5] = p[1] + jy;
      }
    };

    // ── Target cycling ──────────────────────────────────────────────────
    let targetIdx = 0;
    let advanceTimer = null;
    const advance = async () => {
      const t = targets[targetIdx];
      const pts = await buildTarget(t);
      assignTarget(pts);
      const isLast = targetIdx === targets.length - 1;
      const hold = t.hold ?? 1500;
      // Schedule next: settle + hold
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(() => {
        if (isLast) {
          if (!loopTargets) {
            onCycleEnd?.();
            return;
          }
          targetIdx = 0;
        } else {
          targetIdx += 1;
        }
        advance();
      }, hold + 900);
    };
    advance();

    // ── Listeners ────────────────────────────────────────────────────────
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      stateRef.current.mouseX = e.clientX - r.left;
      stateRef.current.mouseY = e.clientY - r.top;
    };
    const onLeave = () => {
      stateRef.current.mouseX = -9999;
      stateRef.current.mouseY = -9999;
    };
    const onScroll = () => {
      const y = window.scrollY;
      stateRef.current.scrollVy = (y - stateRef.current.lastScrollY) * scrollDrift;
      stateRef.current.lastScrollY = y;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    // Pause when off-screen.
    const io = new IntersectionObserver(([entry]) => {
      stateRef.current.visible = entry.isIntersecting;
    }, { threshold: 0 });
    io.observe(wrap);

    // ── Animation loop ───────────────────────────────────────────────────
    let raf;
    const k = 0.045;      // spring stiffness
    const damp = 0.86;    // velocity damping
    const mRad2 = mouseRadius * mouseRadius;

    const tick = () => {
      if (stateRef.current.visible) {
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";

        const mx = stateRef.current.mouseX;
        const my = stateRef.current.mouseY;
        // Sustain the scroll-driven flow — slow decay (0.94 vs 0.9) lets it
        // linger past the gesture so particles visibly "fall" with scroll.
        const sVy = stateRef.current.scrollVy;
        stateRef.current.scrollVy *= 0.94;

        // ── Pass 1: physics ────────────────────────────────────────────
        for (let i = 0; i < N; i++) {
          const o = i * 8;
          let x = P[o], y = P[o + 1];
          let vx = P[o + 2], vy = P[o + 3];
          const tx = P[o + 4], ty = P[o + 5];

          vx += (tx - x) * k;
          vy += (ty - y) * k;
          vx *= damp; vy *= damp;
          // Scroll drag — amplified (1.2 vs 0.6) so the downward flow is visible.
          vy += sVy * 1.2;
          // Cursor repulsion
          const dx = x - mx, dy = y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < mRad2 && d2 > 1) {
            const f = (1 - d2 / mRad2) * 1.8;
            const inv = 1 / Math.sqrt(d2);
            vx += dx * inv * f;
            vy += dy * inv * f;
          }
          P[o] = x + vx;
          P[o + 1] = y + vy;
          P[o + 2] = vx;
          P[o + 3] = vy;
        }

        // ── Pass 2: draw, grouped by colour to cut fillStyle churn ─────
        // 3000 fillStyle ops / frame → 3. The lookup-and-skip is cheap.
        for (let g = 0; g < 3; g++) {
          ctx.fillStyle = COLORS[g];
          for (let i = 0; i < N; i++) {
            const o = i * 8;
            if ((P[o + 6] | 0) !== g) continue;
            const r = P[o + 7];
            ctx.fillRect(P[o] - r * 0.5, P[o + 1] - r * 0.5, r, r);
          }
        }

        ctx.globalCompositeOperation = "source-over";
      }
      raf = requestAnimationFrame(tick);
    };

    if (prefersReduced) {
      // Draw a single static snapshot (drift target) and stop.
      buildTarget({ type: "drift" }).then((pts) => {
        assignTarget(pts);
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = "lighter";
        for (let g = 0; g < 3; g++) {
          ctx.fillStyle = COLORS_STATIC[g];
          for (let i = 0; i < N; i++) {
            const o = i * 8;
            if ((P[o + 6] | 0) !== g) continue;
            const r = P[o + 7];
            ctx.fillRect(P[o + 4] - r / 2, P[o + 5] - r / 2, r, r);
          }
        }
      });
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(advanceTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
