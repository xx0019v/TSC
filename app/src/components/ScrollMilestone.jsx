import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "../lib/lang";

/**
 * ScrollMilestone — a quiet "you're halfway" / "thank you for reading"
 * editorial moment that appears once per session at the 50% and 100%
 * scroll marks. The trigger is silent on first arrival; the visitor
 * notices the brief floating phrase and the small gold-dust burst, then
 * it dissolves and never reappears in that session.
 *
 * Borrowed from achievement micro-celebrations on premium product sites
 * (Linear, Stripe Climate). Reframed for an academy brand: no badges,
 * no points, no progress bars — just a single thin gold line of caption
 * that recognises the reader.
 */

const SESSION_KEY = "tsc-milestones-shown";

const COPY = {
  ja: {
    50: "中ほどへ",
    100: "ありがとう",
  },
  en: {
    50: "halfway",
    100: "thank you",
  },
};

function loadShown() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}
function saveShown(set) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export default function ScrollMilestone() {
  const { lang } = useLang();
  const [active, setActive] = useState(null); // 50 | 100 | null
  const shownRef = useRef(loadShown());
  const lastFireRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = Math.max(1, h.scrollHeight - window.innerHeight);
      const y = window.scrollY || h.scrollTop || 0;
      const p = y / max;

      // Throttle: only consider once every 600ms.
      const now = performance.now();
      if (now - lastFireRef.current < 600) return;

      for (const mark of [50, 100]) {
        if (shownRef.current.has(mark)) continue;
        const threshold = mark / 100;
        // 100% milestone: allow a tiny margin (0.985+) to catch even when
        // the page can't quite scroll to the absolute bottom.
        const hit = mark === 100 ? p >= 0.985 : p >= threshold && p < threshold + 0.06;
        if (hit) {
          shownRef.current.add(mark);
          saveShown(shownRef.current);
          lastFireRef.current = now;
          setActive(mark);
          window.setTimeout(() => setActive((cur) => (cur === mark ? null : cur)), 2400);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copy = COPY[lang] || COPY.en;

  return (
    <div
      aria-live="polite"
      aria-hidden={!active}
      className="pointer-events-none fixed inset-x-0 bottom-12 z-[60] flex justify-center"
    >
      <AnimatePresence>
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center gap-3 rounded-full border border-gold/30 bg-void/70 px-5 py-2 backdrop-blur-md shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7),0_0_40px_-14px_rgba(252,233,184,0.5)]"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-gold-bright" />
            <span className="font-sans text-[0.72rem] uppercase tracking-[0.42em] text-gold-bright">
              {copy[active]}
            </span>
            {/* Tiny gold-dust spark — three dots that pulse outward. */}
            <span aria-hidden="true" className="ml-1 flex items-center gap-1">
              <motion.span
                className="block h-1 w-1 rounded-full bg-gold-bright"
                animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                className="block h-1 w-1 rounded-full bg-gold"
                animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              />
              <motion.span
                className="block h-1 w-1 rounded-full bg-gold/60"
                animate={{ scale: [0.6, 1.4, 0.6], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              />
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
