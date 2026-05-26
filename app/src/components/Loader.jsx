import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const MOTES = Array.from({ length: 14 });

export default function Loader({ onComplete }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const DUR = 2300;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / DUR);
      const eased = 1 - Math.pow(1 - p, 3);
      setPct(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => onComplete?.(), 500);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-void"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 50% 45%, rgba(216,184,106,0.10), transparent 70%)" }}
      />

      {MOTES.map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-[3px] w-[3px] rounded-full bg-gold-bright"
          style={{ left: `${(i * 67) % 100}%`, top: `${(i * 37) % 100}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0], y: [0, -40, -80] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.2, ease: "easeOut" }}
        />
      ))}

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, scale: 1, letterSpacing: "0.28em" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="display text-[clamp(2rem,7vw,3.6rem)] text-ivory"
        >
          TSC
        </motion.div>
        <motion.p
          className="mt-3 font-sans text-[0.7rem] uppercase tracking-[0.4em] text-gold/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          English Academy
        </motion.p>

        <div className="relative mt-9 h-px w-[min(70vw,360px)] overflow-hidden bg-white/10">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold/40 via-gold to-gold-bright"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-4 flex w-[min(70vw,360px)] items-center justify-between font-sans text-[0.66rem] uppercase tracking-[0.25em] text-ivory/45">
          <span>Loading Experience</span>
          <span className="tabular-nums text-gold">{String(pct).padStart(3, "0")}</span>
        </div>
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
