import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ParticleField from "./ParticleField";

/**
 * Cinematic loader. A particle field drifts in the void, gathers into "TSC",
 * dissolves, reforms as "ENGLISH ACADEMY", then breathes out — at which point
 * the loader fades and the hero takes over. No progress bar: a thin orbital
 * arc serves as the only timing cue.
 *
 * Sequencing (ms):
 *   0      → field appears as drift
 *   400    → first target: TSC (hold 1100ms → settle ~700ms)
 *   2200   → second target: ENGLISH ACADEMY (hold 1500ms)
 *   4600   → onComplete (App fades the loader; particles dissolve under it)
 */
const TOTAL = 4600;

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / TOTAL);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else onComplete?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const ARC = 2 * Math.PI * 38; // r=38

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-void"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } }}
    >
      {/* Deep gradient backdrop for depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 45%, rgba(216,184,106,0.10), rgba(5,6,10,0) 70%), radial-gradient(120% 80% at 50% 110%, rgba(11,16,32,0.85), transparent 70%)",
        }}
      />

      {/* The particle morph. Sequence: drift → TSC → ENGLISH ACADEMY → drift dissolve. */}
      <div className="absolute inset-0">
        <ParticleField
          loopTargets={false}
          targets={[
            { type: "drift", hold: 300 },
            { type: "text", text: "TSC", weight: 500, hold: 1100 },
            { type: "text", text: "ENGLISH\nACADEMY", weight: 400, hold: 1500, fontSize: 96 },
            { type: "drift", hold: 800 },
          ]}
          className="absolute inset-0"
        />
      </div>

      {/* Bottom-centre orbital — light arc that fills as time progresses. */}
      <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2">
        <svg width="92" height="92" viewBox="0 0 92 92" className="block">
          <circle cx="46" cy="46" r="38" fill="none" stroke="rgba(245,242,234,0.12)" strokeWidth="1" />
          <circle
            cx="46"
            cy="46"
            r="38"
            fill="none"
            stroke="url(#g)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray={ARC}
            strokeDashoffset={ARC * (1 - progress)}
            transform="rotate(-90 46 46)"
            style={{ transition: "stroke-dashoffset 120ms linear" }}
          />
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#fce9b8" />
              <stop offset="100%" stopColor="#d8b86a" />
            </linearGradient>
          </defs>
        </svg>
        <p className="mt-3 text-center font-sans text-[0.62rem] uppercase tracking-[0.42em] text-ivory/45">
          Entering Experience
        </p>
      </div>

      <button
        type="button"
        onClick={() => onComplete?.()}
        data-cursor
        className="absolute bottom-7 right-7 font-sans text-[0.7rem] uppercase tracking-[0.2em] text-ivory/40 transition-colors duration-200 hover:text-gold"
      >
        Skip →
      </button>
    </motion.div>
  );
}
