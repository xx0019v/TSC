import { useEffect, useRef } from "react";
import Reveal from "../components/Reveal";
import SectionMark from "../components/SectionMark";
import { useLang } from "../lib/lang";
import { prefersReduced, isMobile } from "../lib/env";

/**
 * WordConstellation — a single dominant immersive moment, the teamLab-style
 * heart of the site. Bilingual word pairs drift through dark space at
 * varying depths. The cursor "stirs" the field: nearby words brighten and
 * lean toward the cursor; when both halves of a pair are bright at once a
 * thin gold filament connects them — meaning literally drawn in light.
 *
 * No headline competes with the experience. A small SectionMark sits in
 * one corner and a single-line hint at the bottom; everything else is the
 * canvas. The visitor is free to move slowly through the field or just
 * watch — both readings are intended.
 *
 * Performance: ~30 word objects on desktop / ~14 on mobile, single
 * 2D-canvas RAF gated by IntersectionObserver and document.hidden. Idle
 * cost stays low because draw work is proportional to the number of
 * words above the alpha-cull threshold.
 */

// Bilingual seed list. The pairs are chosen so the JA reading is roughly
// the felt translation of the EN, not a dictionary one.
const PAIRS = [
  { en: "speak",      ja: "話す" },
  { en: "voice",      ja: "声" },
  { en: "listen",     ja: "聴く" },
  { en: "confidence", ja: "自信" },
  { en: "begin",      ja: "始まり" },
  { en: "express",    ja: "伝える" },
  { en: "understand", ja: "わかる" },
  { en: "feel",       ja: "感じる" },
  { en: "open",       ja: "ひらく" },
  { en: "share",      ja: "わかちあう" },
  { en: "calm",       ja: "静けさ" },
  { en: "remember",   ja: "思い出す" },
  { en: "ask",        ja: "問いかける" },
  { en: "answer",     ja: "応える" },
  { en: "continue",   ja: "続ける" },
];

const HINT = {
  ja: "言葉の中を歩いてみてください",
  en: "Move slowly through the words",
};

const TAG = { ja: "言葉の場", en: "Voice Field" };

export default function WordConstellation() {
  const { lang } = useLang();
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const ctx = canvas.getContext("2d", { alpha: true });

    let w = 0, h = 0;
    const resize = () => {
      const r = section.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Build word objects. Each pair becomes two words at different starting
    // positions but with the same pairIdx so connections can find them.
    const pairs = isMobile ? PAIRS.slice(0, 7) : PAIRS;
    const words = [];
    pairs.forEach((pair, idx) => {
      ["en", "ja"].forEach((wordLang, langSlot) => {
        const z = 0.35 + Math.random() * 0.65;
        words.push({
          text: pair[wordLang],
          lang: wordLang,
          pairIdx: idx,
          slot: langSlot,
          x: 80 + Math.random() * Math.max(1, w - 160),
          y: 100 + Math.random() * Math.max(1, h - 200),
          vx: (Math.random() - 0.5) * 0.06,
          vy: (Math.random() - 0.5) * 0.06,
          z,
          baseSize: isMobile ? 14 + z * 18 : 16 + z * 28,
          alpha: 0,
          targetAlpha: 0.15 + z * 0.35,
          // Soft phase for breathing oscillation
          phase: Math.random() * Math.PI * 2,
        });
      });
    });

    let mx = -9999, my = -9999;
    const onMove = (e) => {
      const r = section.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    const onLeave = () => { mx = -9999; my = -9999; };
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0 });
    io.observe(section);

    const radius = isMobile ? 110 : 170;
    const r2 = radius * radius;
    const damp = 0.965;

    let raf;
    let lastTickTime = 0;
    let stillFrames = 0;
    const IDLE_FRAME_MS = 1000 / 30;

    const baseColors = {
      en: "rgba(252,233,184,",  // bright champagne
      ja: "rgba(216,184,106,",  // deeper gold
    };

    const draw = (now) => {
      if (!visible || document.hidden) {
        raf = requestAnimationFrame(draw);
        return;
      }
      // Idle throttle — 30fps when no cursor activity for a while.
      if (mx < -1000) stillFrames++; else stillFrames = 0;
      if (stillFrames > 90 && (now - lastTickTime) < IDLE_FRAME_MS) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastTickTime = now;

      ctx.clearRect(0, 0, w, h);

      // Subtle dark wash so the words sit on a true cinema black.
      ctx.fillStyle = "rgba(5,6,10,0.28)";
      ctx.fillRect(0, 0, w, h);

      // ── Physics ────────────────────────────────────────────────────
      for (const word of words) {
        // Organic drift (small random forces)
        word.vx += (Math.random() - 0.5) * 0.015;
        word.vy += (Math.random() - 0.5) * 0.015;

        // Breathing pull toward a soft centre so words never fly off
        const cx = w / 2;
        const cy = h / 2;
        word.vx += (cx - word.x) * 0.00005;
        word.vy += (cy - word.y) * 0.00005;

        // Cursor influence
        let near = false;
        if (mx > -1000) {
          const dx = word.x - mx;
          const dy = word.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            const d = Math.max(1, Math.sqrt(d2));
            const f = 1 - d / radius;
            // Soft pull toward the cursor
            word.vx -= (dx / d) * f * 0.04;
            word.vy -= (dy / d) * f * 0.04;
            word.targetAlpha = Math.min(1, 0.55 + word.z * 0.4 + f * 0.35);
            near = true;
          }
        }
        if (!near) {
          // Gentle breathing alpha around the baseline.
          word.targetAlpha = 0.18 + word.z * 0.32 + Math.sin(now * 0.0008 + word.phase) * 0.05;
        }

        // Damping + integrate
        word.vx *= damp;
        word.vy *= damp;
        word.x += word.vx;
        word.y += word.vy;

        // Wrap edges so the field feels continuous.
        if (word.x < -120) word.x = w + 120;
        if (word.x > w + 120) word.x = -120;
        if (word.y < -60)  word.y = h + 60;
        if (word.y > h + 60)  word.y = -60;

        // Smooth alpha
        word.alpha += (word.targetAlpha - word.alpha) * 0.10;
      }

      // ── Connection filaments ───────────────────────────────────────
      // For each pair, if both halves are bright AND close enough, draw a
      // soft gold line between them. The line fades with both distance
      // and the minimum brightness of the pair.
      ctx.lineWidth = 0.7;
      for (let i = 0; i < pairs.length; i++) {
        const a = words[i * 2];
        const b = words[i * 2 + 1];
        const minA = Math.min(a.alpha, b.alpha);
        if (minA < 0.42) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const MAX_LINK = 320;
        if (d > MAX_LINK) continue;
        const lineAlpha = minA * (1 - d / MAX_LINK) * 0.7;
        ctx.strokeStyle = `rgba(216,184,106,${lineAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // ── Words ──────────────────────────────────────────────────────
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const word of words) {
        if (word.alpha < 0.06) continue;
        const size = word.baseSize;
        ctx.font = word.lang === "en"
          ? `italic 400 ${size}px 'Cormorant Garamond', 'Times New Roman', serif`
          : `400 ${size}px 'Inter', system-ui, sans-serif`;
        ctx.fillStyle = baseColors[word.lang] + word.alpha.toFixed(3) + ")";
        ctx.fillText(word.text, word.x, word.y);
      }

      raf = requestAnimationFrame(draw);
    };

    if (prefersReduced) {
      // Static snapshot — draw once at base brightness, no RAF.
      for (const word of words) word.alpha = word.targetAlpha;
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
      io.disconnect();
    };
  }, []);

  // Accessible alt-text describing the experience for screen readers.
  const aria = lang === "ja"
    ? "言葉が漂う光の場。マウスを動かすと近くの言葉が光り、対になる言葉と細い金色の線でつながります。"
    : "A drifting field of paired English and Japanese words. Move the cursor to brighten the nearest words; matching pairs join with a thin gold filament.";

  return (
    <section
      id="constellation"
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-label={aria}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block"
        aria-hidden="true"
      />

      {/* Editorial chrome — minimal, corners only, the canvas IS the page. */}
      <Reveal>
        <div className="pointer-events-none absolute left-6 top-12 z-[2] md:left-12 md:top-16">
          <SectionMark number="05" label={TAG[lang] || TAG.en} align="left" />
        </div>
      </Reveal>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-12 z-[2] hidden md:right-12 md:top-16 md:block"
      >
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.42em] text-ivory/40">
          Constellation
        </span>
      </div>

      {/* Hint at the bottom, faint, fades on hover via opacity transition. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="font-sans text-[0.62rem] uppercase tracking-[0.42em] text-ivory/35">
          {HINT[lang] || HINT.en}
        </p>
      </div>
    </section>
  );
}
