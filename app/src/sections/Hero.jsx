import { motion } from "framer-motion";
import { content } from "../content";
import { useLang } from "../lib/lang";
import SplitReveal from "../components/SplitReveal";
import MagneticButton from "../components/MagneticButton";
import ParticleField from "../components/ParticleField";

/**
 * Hero — magazine-cover composition over a quiet particle field.
 *
 * The marble scroll-frame sequence still owns the page backdrop (-z-10).
 * On top of it we layer a low-density particle field that drifts and reacts
 * to the cursor — enough to feel alive, never enough to compete with the
 * editorial typography. Side labels frame the centre stage like a print
 * spread: "00 · HERO" on the left, the section eyebrow rotated on the right.
 */
export default function Hero({ ready }) {
  const { lang } = useLang();
  const t = content[lang].hero;

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-28 text-center md:pt-24"
    >
      {/* Low-density particle field — drifts only, with cursor reactivity. */}
      <ParticleField
        targets={[{ type: "drift", hold: 8000 }]}
        density={800}
        mouseRadius={130}
        scrollDrift={0.18}
        className="absolute inset-0 z-[0]"
      />

      {/* Editorial side marks (PC only — they would crowd mobile). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-7 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex"
      >
        <span className="font-display text-[clamp(3rem,5vw,5.5rem)] leading-none text-gold/85">00</span>
        <span className="h-16 w-px bg-gold/30" />
        <span
          className="font-sans text-[0.62rem] uppercase tracking-[0.45em] text-ivory/40"
          style={{ writingMode: "vertical-rl" }}
        >
          Cover · Hero
        </span>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-9 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-4 md:flex"
      >
        <span
          className="font-sans text-[0.62rem] uppercase tracking-[0.45em] text-ivory/55"
          style={{ writingMode: "vertical-rl" }}
        >
          Vol. 01 · 2026 · Tokyo
        </span>
        <span className="h-16 w-px bg-white/15" />
        <span className="font-display italic text-base text-ivory/55">est.&nbsp;2024</span>
      </div>

      {/* Centre stage. Glass panel keeps the type readable over the live field. */}
      <motion.div
        className="relative z-[1] mx-auto flex w-full max-w-3xl flex-col items-center rounded-[34px] border border-white/10 bg-void/55 px-6 py-10 shadow-[0_50px_140px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:px-12 md:py-12"
        initial={{ opacity: 0, y: 18 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        <motion.div
          className="mb-6 w-[min(196px,44vw)] overflow-hidden rounded-2xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.6)] ring-1 ring-gold/40"
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={ready ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <img
            src={`${import.meta.env.BASE_URL}logo.jpg`}
            alt="TSC English Academy"
            width="640"
            height="640"
            className="block h-auto w-full"
            fetchPriority="high"
          />
        </motion.div>

        <motion.div
          className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-gold/[0.08] px-4 py-2 backdrop-blur-sm"
          initial={{ opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="font-sans text-xs font-medium text-gold-bright md:text-sm">{t.usp}</span>
        </motion.div>

        <motion.p
          className="eyebrow mb-4"
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {t.eyebrow}
        </motion.p>

        <SplitReveal
          as="h1"
          lines={t.title}
          gold={t.goldLine}
          play={ready}
          delay={0.5}
          className="display text-[clamp(1.65rem,4.6vw,3.6rem)] text-ivory"
        />

        <motion.p
          className="mt-6 max-w-[46ch] font-body text-base leading-relaxed text-ivory/65 md:text-lg"
          initial={{ opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.15 }}
        >
          {t.sub}
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.35 }}
        >
          <MagneticButton href="#apply" variant="primary" label="Book">
            {t.primary}
          </MagneticButton>
          <MagneticButton href="#difference" variant="ghost" label="See">
            {t.secondary}
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll indicator stays in place — same as before, anchors the bottom. */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-[2] flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.9 }}
      >
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ivory/40">Scroll</span>
        <span className="relative h-9 w-5 rounded-full border border-gold/40">
          <motion.span
            className="absolute left-1/2 top-1.5 h-1.5 w-0.5 -translate-x-1/2 rounded-full bg-gold"
            animate={{ y: [0, 10, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
