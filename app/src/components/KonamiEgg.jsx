import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "../lib/lang";

/**
 * KonamiEgg — type the three letters t / s / c anywhere on the page to
 * fire a small celebration: a gold ring briefly pulses outward from
 * centre and a single-line greeting fades in. Listeners can subscribe
 * to the same `tsc-celebrate` window event to layer on extra brightness
 * (the GlobalParticleField does, briefly).
 *
 * Awwwards-style hidden interaction. Costs nothing at rest.
 */

const TRIGGER = ["t", "s", "c"];

const COPY = {
  ja: { greeting: "ようこそ" },
  en: { greeting: "welcome" },
};

export default function KonamiEgg() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    let buf = [];
    const onKey = (e) => {
      // Ignore presses inside input/textarea / when modifier held.
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k.length !== 1) return;
      buf.push(k);
      if (buf.length > TRIGGER.length) buf = buf.slice(-TRIGGER.length);
      if (buf.join("") === TRIGGER.join("")) {
        buf = [];
        window.dispatchEvent(new CustomEvent("tsc-celebrate", { detail: { duration: 4500 } }));
        setShow(true);
        window.setTimeout(() => setShow(false), 3200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="konami"
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[59] flex items-center justify-center"
        >
          {/* Expanding gold ring */}
          <motion.span
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute block h-64 w-64 rounded-full border border-gold/45 shadow-[0_0_80px_-10px_rgba(252,233,184,0.6)]"
          />
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 16, letterSpacing: "0.6em" }}
            animate={{ opacity: 1, y: 0, letterSpacing: "0.32em" }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="relative font-display text-[clamp(1.4rem,1rem+2vw,2.2rem)] text-gold-bright"
            style={{ textShadow: "0 0 24px rgba(252,233,184,0.55)" }}
          >
            ✦ {COPY[lang]?.greeting || COPY.en.greeting}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
