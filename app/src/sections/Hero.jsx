import { motion } from "framer-motion";
import { content } from "../content";
import { useLang } from "../lib/lang";
import SplitReveal from "../components/SplitReveal";
import MagneticButton from "../components/MagneticButton";

export default function Hero({ ready }) {
  const { lang } = useLang();
  const t = content[lang].hero;

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pb-16 pt-28 text-center md:pt-24"
    >
      {/* Hero marble backdrop — fully visible bright ivory/gold marble.
          Readability comes from the dark glass panel that holds the content. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}marble.jpg`}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,6,10,0.35), rgba(5,6,10,0.12) 38%, rgba(5,6,10,0.5))",
          }}
        />
      </div>

      {/* Content sits on a dark glass panel so the marble reads bright around it */}
      <motion.div
        className="relative z-[1] mx-auto flex w-full max-w-2xl flex-col items-center rounded-[34px] border border-white/10 bg-void/55 px-6 py-10 shadow-[0_50px_140px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:px-12 md:py-12"
        initial={{ opacity: 0, y: 18 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >

      {/* Official TSC logo, framed as a luxury nameplate */}
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

      {/* USP pill — the interpreter differentiator, front and centre */}
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
        className="display text-[clamp(2.1rem,5.6vw,4.6rem)] text-ivory"
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

      <motion.div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
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
