import { motion } from "framer-motion";
import { content } from "../content";
import { useLang } from "../lib/lang";
import SplitReveal from "../components/SplitReveal";
import MagneticButton from "../components/MagneticButton";
import ParticleField from "../components/ParticleField";

/**
 * Hero — magazine cover composition where the particle field is the *star*,
 * not a background detail. No heavy glass panel; instead a soft radial
 * vignette sets a dark stage for the gold particles to read against. The
 * marble scroll-frame layer still lives at -z-10 globally, so the whole
 * section feels layered: marble → vignette → particles → editorial type.
 */
export default function Hero({ ready }) {
  const { lang } = useLang();
  const t = content[lang].hero;

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-28 text-center md:pt-24"
    >
      {/* 1) Vignette: a soft dark radial that calms the marble underneath so
            the gold particles + headline read crisply. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[0]"
        style={{
          background:
            "radial-gradient(80% 70% at 50% 50%, rgba(5,6,10,0.78) 0%, rgba(5,6,10,0.55) 45%, rgba(5,6,10,0) 80%)",
        }}
      />

      {/* 2) Particle field — high density, boosted size, no glass blocking it. */}
      <ParticleField
        targets={[{ type: "drift", hold: 8000 }]}
        density={1400}
        mouseRadius={160}
        scrollDrift={0.18}
        sizeBoost={1.35}
        brightness={1.05}
        className="absolute inset-0 z-[1]"
      />

      {/* 3) Editorial side marks (PC only). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-7 top-1/2 z-[2] hidden -translate-y-1/2 flex-col items-center gap-4 md:flex"
      >
        <span className="font-display text-[clamp(3rem,5vw,5.5rem)] leading-none text-gold/85">00</span>
        <span className="h-16 w-px bg-gold/30" />
        <span
          className="font-sans text-[0.62rem] uppercase tracking-[0.45em] text-ivory/45"
          style={{ writingMode: "vertical-rl" }}
        >
          Cover · Hero
        </span>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-9 top-1/2 z-[2] hidden -translate-y-1/2 flex-col items-center gap-4 md:flex"
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

      {/* 4) Centre stage — typography floats directly on the particle field. */}
      <motion.div
        className="relative z-[3] mx-auto flex w-full max-w-3xl flex-col items-center px-2 text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        {/* Small editorial logo plate */}
        <motion.div
          className="mb-6 w-[min(132px,32vw)] overflow-hidden rounded-xl border border-white/15 shadow-[0_14px_40px_rgba(0,0,0,0.55)] ring-1 ring-gold/40"
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

        {/* USP pill */}
        <motion.div
          className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-void/40 px-4 py-2 backdrop-blur-sm"
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

        {/* Headline — larger, with a backdrop drop-shadow so it stays legible
            over particles without needing a panel. */}
        <div style={{ textShadow: "0 2px 30px rgba(5,6,10,0.85), 0 0 18px rgba(5,6,10,0.6)" }}>
          <SplitReveal
            as="h1"
            lines={t.title}
            gold={t.goldLine}
            play={ready}
            delay={0.5}
            className="display text-[clamp(1.9rem,5.4vw,4.2rem)] text-ivory"
          />
        </div>

        <motion.p
          className="mt-6 max-w-[46ch] font-body text-base leading-relaxed text-ivory/75 md:text-lg"
          style={{ textShadow: "0 2px 18px rgba(5,6,10,0.85)" }}
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

      {/* 5) Scroll indicator — same as before. */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-[3] flex -translate-x-1/2 flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.9 }}
      >
        <span className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ivory/45">Scroll</span>
        <span className="relative h-9 w-5 rounded-full border border-gold/50">
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
