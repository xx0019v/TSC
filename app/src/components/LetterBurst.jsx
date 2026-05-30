import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { prefersReduced, isMobile } from "../lib/env";

/**
 * LetterBurst — typography becomes interactive. Each letter is an
 * `inline-block` span that springs outward when the cursor approaches and
 * resettles when the cursor leaves. A click sends a soft radial shockwave
 * — letters within range scatter briefly then heal back into the word.
 *
 * Design constraints:
 *   • Idle state: typography looks unchanged.
 *   • Hover proximity: only the letters near the cursor displace.
 *   • Click: short, contained shockwave — never a destructive explosion.
 *   • Reduced motion / mobile: letters do not animate; pure typography.
 *   • Accessibility: a parent `aria-label` carries the original sentence;
 *     per-letter spans are aria-hidden so screen readers don't spell.
 *
 * Performance:
 *   • Per-letter base offsets cached once on mount + on resize.
 *   • One `getBoundingClientRect` per frame on the wrapper (not per letter).
 *   • One spring integration per letter per frame (cheap, <50 letters).
 *   • IntersectionObserver pauses work when off-screen.
 *
 * Props:
 *   lines     string | string[] — one or more lines to render.
 *   goldLine  index of the line that should render in gold (-1 = none).
 *   as        wrapper element tag ('h1' | 'h2' | 'span' | …).
 *   play      reveal trigger; when true, lines fade-up with stagger.
 *   delay     reveal start delay in seconds.
 *   radius    hover repulsion radius (px). Lower = subtler.
 *   push      max hover displacement (px). Lower = subtler.
 *   intensity overall multiplier for hover + click forces (0..2).
 *   className applied to the wrapper.
 */
export default function LetterBurst({
  lines,
  goldLine = -1,
  as = "span",
  play = true,
  delay = 0,
  radius = 70,
  push = 14,
  intensity = 1,
  className = "",
}) {
  const wrapRef = useRef(null);
  const lettersRef = useRef([]);
  const lineFlags = useRef([]); // [{ isGold }, …] aligned with letters

  const linesArr = Array.isArray(lines) ? lines : [lines];

  useEffect(() => {
    if (prefersReduced || isMobile) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Per-letter state — base offset from wrapper origin, current/target xfm.
    const state = lettersRef.current.map(() => ({
      ox: 0, oy: 0, // base centre offset from wrapper
      tx: 0, ty: 0, tr: 0, // target translation + rotation
      cx: 0, cy: 0, cr: 0, // current (springing) translation + rotation
    }));

    const cacheOffsets = () => {
      lettersRef.current.forEach((l) => { if (l) l.style.transform = ""; });
      const wr = wrap.getBoundingClientRect();
      lettersRef.current.forEach((letter, i) => {
        if (!letter) return;
        const r = letter.getBoundingClientRect();
        state[i].ox = r.left + r.width / 2 - wr.left;
        state[i].oy = r.top + r.height / 2 - wr.top;
      });
    };

    // Cache after layout settles (fonts + Motion reveal both take a moment).
    const settle = setTimeout(cacheOffsets, 1300);
    if (document.fonts?.ready) document.fonts.ready.then(cacheOffsets);
    else cacheOffsets();

    let mx = -9999, my = -9999;
    const click = { active: false, x: 0, y: 0, time: 0 };

    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    const onLeave = () => { mx = -9999; my = -9999; };
    const onClick = (e) => {
      click.active = true;
      click.x = e.clientX;
      click.y = e.clientY;
      click.time = performance.now();
    };
    const onResize = () => { cacheOffsets(); };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    wrap.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0 });
    io.observe(wrap);

    const r2 = radius * radius;
    const clickR = 240;
    const clickR2 = clickR * clickR;

    let raf;
    let stillFrames = 0;
    let wasActive = false;

    const tick = () => {
      if (!visible) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const wr = wrap.getBoundingClientRect();
      const wox = wr.left;
      const woy = wr.top;

      const clickElapsed = performance.now() - click.time;
      const clickActive = click.active && clickElapsed < 700;
      if (click.active && clickElapsed >= 700) click.active = false;
      const clickDecay = clickActive ? 1 - clickElapsed / 700 : 0;

      let anyActive = false;

      for (let i = 0; i < state.length; i++) {
        const letter = lettersRef.current[i];
        if (!letter) continue;
        const s = state[i];
        const lcx = wox + s.ox;
        const lcy = woy + s.oy;

        let tx = 0, ty = 0, tr = 0;

        // Hover repulsion
        if (mx > -1000) {
          const dx = lcx - mx;
          const dy = lcy - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            const d = Math.max(1, Math.sqrt(d2));
            const f = (1 - d / radius) * intensity;
            tx += (dx / d) * f * push;
            ty += (dy / d) * f * push;
            tr += (dx / d) * f * 5;
          }
        }

        // Click shockwave (decaying outward push)
        if (clickActive) {
          const cdx = lcx - click.x;
          const cdy = lcy - click.y;
          const cd2 = cdx * cdx + cdy * cdy;
          if (cd2 < clickR2) {
            const cd = Math.max(1, Math.sqrt(cd2));
            const cf = (1 - cd / clickR) * clickDecay * intensity;
            tx += (cdx / cd) * cf * 26;
            ty += (cdy / cd) * cf * 26;
            tr += cf * 14 * ((i & 1) ? 1 : -1);
          }
        }

        s.tx = tx; s.ty = ty; s.tr = tr;
        s.cx += (tx - s.cx) * 0.18;
        s.cy += (ty - s.cy) * 0.18;
        s.cr += (tr - s.cr) * 0.18;

        const moving = Math.abs(s.cx) + Math.abs(s.cy) + Math.abs(s.cr);
        if (moving > 0.05) anyActive = true;

        letter.style.transform = `translate3d(${s.cx.toFixed(2)}px, ${s.cy.toFixed(2)}px, 0) rotate(${s.cr.toFixed(2)}deg)`;
      }

      if (!anyActive) {
        stillFrames++;
        if (stillFrames > 30 && !wasActive) {
          // True idle — skip work; next pointermove will resume.
          raf = requestAnimationFrame(tick);
          return;
        }
      } else {
        stillFrames = 0;
      }
      wasActive = anyActive;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      clearTimeout(settle);
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      io.disconnect();
    };
  }, [linesArr.join("|"), radius, push, intensity]);

  const Wrapper = as;
  const ariaLabel = linesArr.join(" ");

  // Build a flat index across all lines so refs can live in one array.
  let flatIdx = 0;
  lettersRef.current = [];
  lineFlags.current = [];

  return (
    <Wrapper
      ref={wrapRef}
      className={`relative ${className}`}
      aria-label={ariaLabel}
    >
      {linesArr.map((line, lineIdx) => {
        const isGold = lineIdx === goldLine;
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
            {Array.from(line).map((ch, i) => {
              if (ch === " ") return <span key={i}>{" "}</span>;
              const myIdx = flatIdx++;
              lineFlags.current[myIdx] = { isGold };
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
          </motion.span>
        );
      })}
    </Wrapper>
  );
}
