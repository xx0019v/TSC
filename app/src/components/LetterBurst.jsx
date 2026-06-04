import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { prefersReduced, isMobile } from "../lib/env";

/**
 * LetterBurst — typography that reacts to cursor proximity in three phases:
 *
 *   burst (~0.4s)   each touched letter snaps outward to a scatter target
 *   linger (~1.8s)  letters drift quietly at the scatter position
 *   release (~2.8s) letters ease back to the original position
 *
 * Total ≈5s from the moment the cursor leaves the letter. Re-entering the
 * radius at any phase regenerates a fresh scatter target — no need to wait
 * for the release to finish. Idle state: typography looks completely
 * unchanged.
 *
 * Performance:
 *   • One `getBoundingClientRect` per frame on the wrapper.
 *   • Per-letter state held in plain objects; per-letter writes only happen
 *     when the letter is not idle.
 *   • IntersectionObserver pauses RAF when the heading is off-screen.
 *   • Reduced motion / mobile → letters render as plain typography.
 */
export default function LetterBurst({
  lines,
  goldLine = -1,
  as = "span",
  play = true,
  delay = 0,
  radius = 80,
  push = 26,
  intensity = 1,
  burstMs = 400,
  lingerMs = 1800,
  releaseMs = 2800,
  className = "",
}) {
  const wrapRef = useRef(null);
  const lettersRef = useRef([]);

  const linesArr = Array.isArray(lines) ? lines : [lines];

  useEffect(() => {
    if (prefersReduced || isMobile) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Per-letter state.
    const state = lettersRef.current.map(() => ({
      ox: 0, oy: 0,                   // base centre offset from wrapper
      scX: 0, scY: 0, scR: 0,         // current scatter target
      cx: 0, cy: 0, cr: 0,            // rendered position
      phase: "idle",                  // 'idle' | 'burst' | 'linger' | 'release'
      lingerStart: 0,
      releaseStart: 0,
      relFromX: 0, relFromY: 0, relFromR: 0, // position when release began
    }));

    const cacheOffsets = () => {
      lettersRef.current.forEach((l) => { if (l) l.style.transform = ""; });
      const wr = wrap.getBoundingClientRect();
      lettersRef.current.forEach((letter, i) => {
        if (!letter || !state[i]) return;
        const r = letter.getBoundingClientRect();
        state[i].ox = r.left + r.width / 2 - wr.left;
        state[i].oy = r.top + r.height / 2 - wr.top;
      });
    };

    const settle = setTimeout(cacheOffsets, 1300);
    if (document.fonts?.ready) document.fonts.ready.then(cacheOffsets);
    else cacheOffsets();

    let mx = -9999, my = -9999;
    let raf = null;

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const onLeave = () => { mx = -9999; my = -9999; };
    const onResize = () => { cacheOffsets(); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("resize", onResize);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0 });
    io.observe(wrap);

    const r2 = radius * radius;
    let stillFrames = 0;
    let lastTickTime = 0;

    const tick = (now) => {
      if (document.hidden) {
        // Browser throttles RAF when hidden anyway; we just no-op fast.
        raf = requestAnimationFrame(tick);
        return;
      }
      if (!visible) {
        raf = requestAnimationFrame(tick);
        return;
      }
      // When deeply idle, throttle to ~30fps instead of stopping. This
      // is the safe middle ground: we still wake instantly on the next
      // pointermove (the cursor proximity check happens every tick),
      // and we cut idle work in half.
      const deeplyIdle = stillFrames > 30;
      if (deeplyIdle && (now - lastTickTime) < 33) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastTickTime = now;

      const wr = wrap.getBoundingClientRect();
      const wox = wr.left;
      const woy = wr.top;
      let anyActive = false;

      for (let i = 0; i < state.length; i++) {
        const letter = lettersRef.current[i];
        if (!letter) continue;
        const s = state[i];
        const lcx = wox + s.ox;
        const lcy = woy + s.oy;

        // Cursor proximity check.
        let cursorNear = false;
        let dirX = 0, dirY = 0, force = 0;
        if (mx > -1000) {
          const dx = lcx - mx;
          const dy = lcy - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            const d = Math.max(1, Math.sqrt(d2));
            dirX = dx / d;
            dirY = dy / d;
            force = 1 - d / radius;
            cursorNear = true;
          }
        }

        if (cursorNear) {
          // Refresh scatter target whenever (re-)entering burst.
          if (s.phase === "idle" || s.phase === "release" || s.phase === "linger") {
            const mag = force * push * intensity;
            const jitter = push * 0.35;
            s.scX = dirX * mag + (Math.random() - 0.5) * jitter;
            s.scY = dirY * mag + (Math.random() - 0.5) * jitter;
            s.scR = (Math.random() - 0.5) * 14 * intensity;
            s.phase = "burst";
          }
          // Snappy spring toward scatter + tiny wobble.
          const wobX = Math.sin(now * 0.003 + s.ox * 0.013) * 1.6;
          const wobY = Math.cos(now * 0.003 + s.oy * 0.011) * 1.6;
          const tx = s.scX + wobX;
          const ty = s.scY + wobY;
          s.cx += (tx - s.cx) * 0.22;
          s.cy += (ty - s.cy) * 0.22;
          s.cr += (s.scR - s.cr) * 0.18;
          anyActive = true;
        } else {
          if (s.phase === "burst") {
            s.phase = "linger";
            s.lingerStart = now;
          }

          if (s.phase === "linger") {
            const elapsed = now - s.lingerStart;
            if (elapsed >= lingerMs) {
              s.phase = "release";
              s.releaseStart = now;
              s.relFromX = s.cx;
              s.relFromY = s.cy;
              s.relFromR = s.cr;
            } else {
              // Slow drift around the scatter point — like sand on water.
              const wobX = Math.sin(now * 0.0022 + s.ox * 0.013) * 2.2;
              const wobY = Math.cos(now * 0.0022 + s.oy * 0.011) * 2.2;
              const tx = s.scX + wobX;
              const ty = s.scY + wobY;
              s.cx += (tx - s.cx) * 0.10;
              s.cy += (ty - s.cy) * 0.10;
              s.cr += (s.scR - s.cr) * 0.08;
              anyActive = true;
            }
          }

          if (s.phase === "release") {
            const elapsed = now - s.releaseStart;
            if (elapsed >= releaseMs) {
              s.phase = "idle";
              s.cx = 0; s.cy = 0; s.cr = 0;
            } else {
              const p = elapsed / releaseMs;
              const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
              s.cx = s.relFromX * (1 - eased);
              s.cy = s.relFromY * (1 - eased);
              s.cr = s.relFromR * (1 - eased);
              anyActive = true;
            }
          }
          // 'idle' — nothing to do
        }

        if (s.phase !== "idle" || cursorNear) {
          letter.style.transform = `translate3d(${s.cx.toFixed(2)}px, ${s.cy.toFixed(2)}px, 0) rotate(${s.cr.toFixed(2)}deg)`;
        } else if (s.cx !== 0 || s.cy !== 0 || s.cr !== 0) {
          letter.style.transform = "";
          s.cx = 0; s.cy = 0; s.cr = 0;
        }
      }

      if (!anyActive) {
        stillFrames++;
      } else {
        stillFrames = 0;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      clearTimeout(settle);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, [linesArr.join("|"), radius, push, intensity, burstMs, lingerMs, releaseMs]);

  const Wrapper = as;
  const ariaLabel = linesArr.join(" ");
  let flatIdx = 0;
  lettersRef.current = [];

  return (
    <Wrapper ref={wrapRef} className={`relative ${className}`} aria-label={ariaLabel}>
      {linesArr.map((line, lineIdx) => {
        const isGold = lineIdx === goldLine;
        // Split on whitespace runs and KEEP the spaces as separate segments.
        // Each non-whitespace segment becomes a `white-space: nowrap` word so
        // browsers can't break a word mid-letter (which would otherwise happen
        // because every glyph is its own inline-block span). Spaces remain
        // wrappable, so line breaks still happen at word boundaries.
        const segments = line.split(/(\s+)/).filter((s) => s !== "");
        return (
          <motion.span
            key={`${lineIdx}-${line}`}
            className={`block ${isGold ? "text-gold" : "text-ivory"}`}
            initial={{ opacity: 0, y: 16 }}
            animate={play ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.85,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + lineIdx * 0.12,
            }}
            aria-hidden="true"
          >
            {segments.map((segment, segIdx) => {
              if (/^\s+$/.test(segment)) {
                return <span key={segIdx}>{segment}</span>;
              }
              return (
                <span
                  key={segIdx}
                  style={{ display: "inline-block", whiteSpace: "nowrap" }}
                >
                  {Array.from(segment).map((ch, i) => {
                    const myIdx = flatIdx++;
                    return (
                      <span
                        key={i}
                        ref={(el) => (lettersRef.current[myIdx] = el)}
                        style={{ display: "inline-block", willChange: "transform" }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                </span>
              );
            })}
          </motion.span>
        );
      })}
    </Wrapper>
  );
}
