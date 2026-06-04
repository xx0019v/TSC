import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "../components/Reveal";
import LetterBurst from "../components/LetterBurst";
import SectionMark from "../components/SectionMark";
import { useLang } from "../lib/lang";
import { prefersReduced } from "../lib/env";

/**
 * ConfidenceCapsule — an interactive experiment that frames the TSC learning
 * arc as a typographic ritual: the fearful sentence shatters into letters
 * inside a luxe glass capsule, then reforms as the confident counterpart.
 *
 * Inspired by the "text becomes interface" web experiment, recast here in
 * the academy's quiet-luxury voice: no playful jars, no kid energy — just a
 * dark glass capsule, gold trim, and the brand belief that words become
 * confidence.
 */

const PAIRS_EN = [
  { fear: "I'm afraid to speak",       positive: "I speak with confidence" },
  { fear: "I don't know what to say",  positive: "I have words to share" },
  { fear: "I can't express myself",    positive: "I express myself fully" },
  { fear: "I want to speak naturally", positive: "I do speak naturally" },
  { fear: "I want confidence",         positive: "Confidence is mine" },
];

const PAIRS_JA = [
  { fear: "話すのが怖い",            positive: "自信を持って話せる" },
  { fear: "何を言えばいいか分からない", positive: "伝えたい言葉がある" },
  { fear: "うまく表現できない",       positive: "自分の言葉で 表現できる" },
  { fear: "自然に話したい",           positive: "もう 自然に話している" },
  { fear: "自信が欲しい",             positive: "自信は もう私のもの" },
];

const COPY = {
  en: {
    eyebrow: "An interactive experiment",
    title: ["Break the silence", "Build your voice"],
    body: "Pick a feeling\nWatch it dissolve\nand return as the line you'll speak",
    transformLabel: "Transform",
    resetLabel: "Try another",
    hint: "Tap a chip · then Transform · click the capsule to scatter",
  },
  ja: {
    eyebrow: "Interactive Experiment",
    title: ["沈黙を超えて", "声に変える"],
    body: "気持ちをひとつ選んでください\n文字が散り あなたの言葉になって戻ります",
    transformLabel: "変える",
    resetLabel: "別の言葉",
    hint: "気持ちを選ぶ · Transform · カプセルをクリックして散らす",
  },
};

/** A single string rendered as motion letters with stagger in/out. Used
 *  inside <AnimatePresence mode="wait"> so the swap dissolves cleanly. */
function CapsuleText({ text, gold = false }) {
  const reduce = prefersReduced;
  const chars = Array.from(text);
  return (
    <span
      className={`relative inline-block ${gold ? "text-gold-bright" : "text-ivory"}`}
      aria-label={text}
    >
      {chars.map((ch, i) => {
        const space = ch === " ";
        const rxOut = (Math.random() - 0.5) * 280;
        const ryOut = (Math.random() - 0.5) * 140;
        const rrOut = (Math.random() - 0.5) * 160;
        const rxIn = (Math.random() - 0.5) * 240;
        const ryIn = (Math.random() - 0.5) * 120;
        const rrIn = (Math.random() - 0.5) * 100;
        return (
          <motion.span
            key={i}
            className="inline-block"
            aria-hidden="true"
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: rxIn, y: ryIn, rotate: rrIn, scale: 0.7, filter: "blur(6px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: rxOut, y: ryOut, rotate: rrOut, scale: 0.6, filter: "blur(8px)" }}
            transition={{
              duration: reduce ? 0.2 : 0.7,
              ease: [0.16, 1, 0.3, 1],
              delay: reduce ? 0 : i * 0.018,
            }}
          >
            {space ? " " : ch}
          </motion.span>
        );
      })}
    </span>
  );
}

export default function ConfidenceCapsule() {
  const { lang } = useLang();
  const PAIRS = lang === "ja" ? PAIRS_JA : PAIRS_EN;
  const t = COPY[lang] || COPY.en;

  const [pairIdx, setPairIdx] = useState(0);
  const [stage, setStage] = useState("fear"); // 'fear' | 'positive'
  const pair = PAIRS[pairIdx];
  const current = stage === "fear" ? pair.fear : pair.positive;

  const pick = (i) => {
    setPairIdx(i);
    setStage("fear");
  };
  const transform = () => {
    setStage((s) => (s === "fear" ? "positive" : "fear"));
  };
  // Click on the capsule body re-scatters and reforms — a small "shake" gesture.
  const onCapsuleClick = () => {
    // Toggle stage to trigger AnimatePresence swap; if already positive, restart with fear.
    setStage((s) => (s === "fear" ? "positive" : "fear"));
  };

  return (
    <section id="capsule" className="relative overflow-hidden py-28 md:py-40">
      <div className="container-x relative z-[1] mx-auto max-w-4xl text-center">
        <Reveal><SectionMark number="05" label="Confidence Capsule" /></Reveal>
        <Reveal>
          <p className="eyebrow mb-5">{t.eyebrow}</p>
        </Reveal>
        <div style={{ textShadow: "0 2px 24px rgba(5,6,10,0.7)" }}>
          <LetterBurst
            as="h2"
            lines={t.title}
            goldLine={1}
            play
            delay={0.05}
            className="display text-[clamp(2rem,1rem+3.4vw,3.8rem)]"
            radius={56}
            push={11}
          />
        </div>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-[52ch] font-body text-base text-ivory/60 md:text-lg">
            {t.body}
          </p>
        </Reveal>

        {/* ── The capsule ─────────────────────────────────────────── */}
        <Reveal delay={0.18} y={48}>
          <div className="relative mx-auto mt-14 max-w-3xl">
            {/* Glass body */}
            <div
              role="button"
              tabIndex={0}
              onClick={onCapsuleClick}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCapsuleClick(); } }}
              data-cursor
              data-cursor-label={stage === "fear" ? "Reveal" : "Reset"}
              className="relative overflow-hidden rounded-[34px] border border-white/12 bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent px-6 py-16 backdrop-blur-md shadow-[0_60px_140px_-30px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] md:px-12 md:py-20"
              style={{ cursor: "none" }}
            >
              {/* Gold inner trim */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-3 rounded-[26px] border border-gold/15"
              />
              {/* Refraction highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-10 -top-20 h-40 rounded-full opacity-60 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(252,233,184,0.18), transparent 65%)" }}
              />
              {/* Soft base glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-24 left-1/2 h-44 w-[80%] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(216,184,106,0.20), transparent 70%)" }}
              />

              {/* The transforming line */}
              <div className="relative flex min-h-[8.5rem] items-center justify-center text-center md:min-h-[9rem]">
                <span
                  className="display text-[clamp(1.4rem,1rem+2.6vw,2.8rem)] leading-[1.1]"
                  style={{ textShadow: "0 4px 32px rgba(5,6,10,0.6)" }}
                >
                  <AnimatePresence mode="wait">
                    <CapsuleText key={current} text={current} gold={stage === "positive"} />
                  </AnimatePresence>
                </span>
              </div>

              {/* Stage indicator */}
              <div className="relative mt-6 flex items-center justify-center gap-2 font-sans text-[0.62rem] uppercase tracking-[0.42em] text-ivory/40">
                <span className={`h-1.5 w-1.5 rounded-full ${stage === "fear" ? "bg-ivory/50" : "bg-ivory/15"}`} />
                <span>before</span>
                <span className="mx-2 h-px w-8 bg-white/10" />
                <span>after</span>
                <span className={`h-1.5 w-1.5 rounded-full ${stage === "positive" ? "bg-gold" : "bg-ivory/15"}`} />
              </div>
            </div>

            {/* Hint */}
            <p className="mt-5 font-sans text-[0.66rem] uppercase tracking-[0.34em] text-ivory/40">
              {t.hint}
            </p>

            {/* Chips */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
              {PAIRS.map((p, i) => (
                <button
                  key={p.fear}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); pick(i); }}
                  data-cursor
                  data-cursor-label="Pick"
                  className={`group relative rounded-full border px-4 py-2 font-sans text-[0.78rem] tracking-wide transition-all duration-300 ${
                    i === pairIdx
                      ? "border-gold/50 bg-gold/10 text-gold-bright"
                      : "border-white/12 bg-white/[0.03] text-ivory/65 hover:border-gold/30 hover:text-ivory"
                  }`}
                >
                  {p.fear}
                </button>
              ))}
            </div>

            {/* Transform button */}
            <div className="mt-8 flex items-center justify-center">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); transform(); }}
                data-cursor
                data-cursor-label={stage === "fear" ? "Burst" : "Reset"}
                className="relative inline-flex items-center justify-center gap-3 rounded-full border border-gold/40 bg-gradient-to-br from-gold-bright/15 to-gold/5 px-7 py-3 font-sans text-sm tracking-wide text-gold-bright transition-all duration-300 hover:from-gold-bright/25 hover:to-gold/10 hover:shadow-[0_0_40px_-8px_rgba(216,184,106,0.6)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold-bright" />
                {stage === "fear" ? t.transformLabel : t.resetLabel}
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
