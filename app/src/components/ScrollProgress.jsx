import { useEffect, useState } from "react";

/**
 * Vertical scroll-progress rail with section dots — a premium navigation cue
 * that appears in spiral-cap / ds-k. Sits fixed on the right edge; the dot
 * for the section currently in view glows gold.
 */
const SECTIONS = [
  { id: "hero",       label: "00" },
  { id: "difference", label: "01" },
  { id: "features",   label: "02" },
  { id: "showcase",   label: "03" },
  { id: "path",       label: "04" },
  { id: "capsule",    label: "05" },
  { id: "pricing",    label: "06" },
  { id: "faq",        label: "07" },
  { id: "apply",      label: "08" },
];

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("hero");

  useEffect(() => {
    let raf;
    const tick = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - window.innerHeight;
      const y = window.scrollY || h.scrollTop || 0;
      setProgress(max > 0 ? y / max : 0);
      // Find the section closest to the viewport center.
      const mid = window.innerHeight * 0.4;
      let best = SECTIONS[0].id;
      let bestDist = Infinity;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top - mid);
        if (r.top < window.innerHeight && r.bottom > 0 && dist < bestDist) {
          bestDist = dist;
          best = s.id;
        }
      }
      setActive(best);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <aside
      aria-hidden="true"
      className="pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 md:block"
    >
      <div className="relative flex h-[58vh] flex-col items-center">
        {/* Track */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
        {/* Filled progress */}
        <div
          className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-gold-bright via-gold to-gold/30"
          style={{ height: `${Math.max(0, Math.min(1, progress)) * 100}%`, transition: "height 120ms linear" }}
        />
        {/* Dots */}
        <div className="relative flex h-full flex-col justify-between">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <div key={s.id} className="relative flex items-center">
                <span
                  className={`block h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    isActive ? "scale-125 bg-gold shadow-[0_0_14px_2px_rgba(216,184,106,0.55)]" : "bg-white/25"
                  }`}
                />
                <span
                  className={`absolute right-5 font-sans text-[0.62rem] tracking-[0.32em] transition-opacity duration-300 ${
                    isActive ? "text-gold opacity-100" : "text-ivory/40 opacity-70"
                  }`}
                  style={{ writingMode: "horizontal-tb" }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
