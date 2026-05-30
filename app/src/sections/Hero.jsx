import { motion, useScroll, useTransform } from "framer-motion";
import { content } from "../content";
import { useLang } from "../lib/lang";
import SplitReveal from "../components/SplitReveal";
import MagneticButton from "../components/MagneticButton";
import LetterBurst from "../components/LetterBurst";

/**
 * Hero — magazine-cover composition. One dominant element (the headline)
 * floats on a particle field; logo, metadata and USP retreat to the corners
 * like a printed spread. Asymmetric, oversized type, generous black space —
 * the layout deliberately fights the "everything-centred" SaaS hero.
 */
export default function Hero({ ready }) {
  const { lang } = useLang();
  const t = content[lang].hero;

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay },
  });

  // Scroll-driven departure — as the user scrolls into the next section the
  // hero's centre column eases out (translateY + scale + opacity). Gives the
  // first section a cinematic exit rather than a hard cut.
  const { scrollY } = useScroll();
  const stageY = useTransform(scrollY, [0, 700], [0, -160]);
  const stageScale = useTransform(scrollY, [0, 700], [1, 0.92]);
  const stageOpacity = useTransform(scrollY, [0, 480, 720], [1, 0.6, 0]);
  const stageBlur = useTransform(scrollY, [300, 720], ["blur(0px)", "blur(4px)"]);
  // Side marks linger a little longer.
  const sideOpacity = useTransform(scrollY, [0, 550, 780], [1, 0.6, 0]);

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* Soft radial vignette — calms the marble without darkening so much
          that the global particle field can't shine through. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[0]"
        style={{
          background:
            "radial-gradient(80% 70% at 50% 50%, rgba(5,6,10,0.55) 0%, rgba(5,6,10,0.35) 45%, rgba(5,6,10,0.05) 85%)",
        }}
      />

      {/* Particles are now provided by the site-wide GlobalParticleField at
          zIndex: -5. This section's profile (hero) is the most prominent. */}

      {/* ── Top bar: wordmark left, logo right ─────────────────────────── */}
      <motion.div
        className="relative z-[3] flex items-center justify-between px-6 pt-24 md:px-12 md:pt-28"
        {...fadeUp(0.15)}
      >
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/60 md:w-14" />
          <span className="font-sans text-[0.62rem] uppercase tracking-[0.42em] text-ivory/70 md:text-[0.7rem] md:tracking-[0.5em]">
            TSC English Academy · Vol. 01 · 2026
          </span>
        </div>
        <div className="relative h-[58px] w-[58px] overflow-hidden rounded-md border border-white/15 shadow-[0_10px_28px_rgba(0,0,0,0.55)] ring-1 ring-gold/35 md:h-[68px] md:w-[68px]">
          <img
            src={`${import.meta.env.BASE_URL}logo.jpg`}
            alt="TSC English Academy"
            width="640"
            height="640"
            className="block h-full w-full object-cover"
            fetchPriority="high"
          />
        </div>
      </motion.div>

      {/* ── Left vertical strip (PC only) ──────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-6 top-1/2 z-[3] hidden -translate-y-1/2 flex-col items-center gap-5 md:flex"
        style={{ opacity: sideOpacity }}
      >
        <span
          className="font-display italic text-[0.95rem] tracking-wide text-gold"
          style={{ writingMode: "vertical-rl" }}
        >
          N° 01 — Cover
        </span>
        <span className="h-20 w-px bg-gold/30" />
        <span
          className="font-sans text-[0.6rem] uppercase tracking-[0.5em] text-ivory/45"
          style={{ writingMode: "vertical-rl" }}
        >
          Tokyo · Worldwide
        </span>
      </motion.div>

      {/* ── Right vertical strip (PC only) ─────────────────────────────── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-1/2 z-[3] hidden -translate-y-1/2 flex-col items-center gap-5 md:flex"
        style={{ opacity: sideOpacity }}
      >
        <span className="font-display italic text-base text-ivory/55">est.&nbsp;2024</span>
        <span className="h-20 w-px bg-white/15" />
        <span
          className="font-sans text-[0.6rem] uppercase tracking-[0.5em] text-ivory/55"
          style={{ writingMode: "vertical-rl" }}
        >
          Online English Academy
        </span>
      </motion.div>

      {/* ── Main stage: headline, dominant ──────────────────────────────── */}
      <motion.div
        className="relative z-[3] flex flex-1 items-center justify-center px-6 md:px-16"
        style={{ y: stageY, scale: stageScale, opacity: stageOpacity, filter: stageBlur }}
      >
        <div className="mx-auto w-full max-w-5xl text-center">
          <motion.p className="eyebrow mb-6" {...fadeUp(0.4)}>
            {t.eyebrow}
          </motion.p>

          {/* Oversized headline. Letters are real HTML (legible, accessible);
              a canvas overlay dusts them with gold particles that gather to
              the letter forms and gently disperse around the cursor. */}
          <div
            className="display"
            style={{ textShadow: "0 4px 36px rgba(5,6,10,0.85), 0 0 18px rgba(5,6,10,0.7)" }}
          >
            <LetterBurst
              as="h1"
              lines={t.title}
              goldLine={t.goldLine}
              play={ready}
              delay={0.55}
              radius={78}
              push={18}
              intensity={1.15}
              className="text-[clamp(2.4rem,7.4vw,6rem)] leading-[1.02] tracking-[-0.02em]"
            />
          </div>

          <motion.p
            className="mx-auto mt-8 max-w-[48ch] whitespace-pre-line font-body text-base leading-relaxed text-ivory/75 md:text-lg"
            style={{ textShadow: "0 2px 18px rgba(5,6,10,0.85)" }}
            {...fadeUp(1.2)}
          >
            {t.sub}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
            {...fadeUp(1.4)}
          >
            <MagneticButton href="#apply" variant="primary" label="Book">
              {t.primary}
            </MagneticButton>
            <MagneticButton href="#difference" variant="ghost" label="See">
              {t.secondary}
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Bottom bar: USP rule on left, SCROLL on right ──────────────── */}
      <motion.div
        className="relative z-[3] flex items-end justify-between gap-6 px-6 pb-10 md:px-12 md:pb-12"
        {...fadeUp(1.7)}
      >
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gold/60 md:w-16" />
          <span className="font-sans text-[0.7rem] uppercase tracking-[0.32em] text-gold-bright md:text-[0.82rem]">
            {t.usp}
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-sans text-[0.58rem] uppercase tracking-[0.32em] text-ivory/45">
            Scroll
          </span>
          <span className="relative h-9 w-5 rounded-full border border-gold/45">
            <motion.span
              className="absolute left-1/2 top-1.5 h-1.5 w-0.5 -translate-x-1/2 rounded-full bg-gold"
              animate={{ y: [0, 10, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </div>
      </motion.div>
    </section>
  );
}
