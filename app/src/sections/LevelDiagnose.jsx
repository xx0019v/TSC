import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "../components/Reveal";
import LetterBurst from "../components/LetterBurst";
import SectionMark from "../components/SectionMark";
import { useLang } from "../lib/lang";

/**
 * LevelDiagnose — a four-step interactive that confirms a visitor's goal,
 * level, schedule shape and lesson format, then recommends a TSC course in
 * the same brand voice as the rest of the site.
 *
 * No backend; the recommendation is computed entirely from local state.
 * Progress and answers are mirrored to localStorage so a refresh resumes
 * mid-flow.
 *
 * Lives between Showcase and ConfidenceCapsule — visitors who reached
 * here have seen the lessons but haven't been asked to commit yet.
 */

const STORAGE_KEY = "tsc-level-diagnose";

const COPY = {
  ja: {
    eyebrow: "Personal Guide",
    title: ["あなたの道を", "そっと整える"],
    body: "4 つの質問にお答えください\n最後にあなたに合うコースをご提案します",
    steps: [
      {
        key: "goal",
        question: "英語で 一番伸ばしたいのは",
        options: [
          { id: "daily",    label: "日常会話" },
          { id: "biz",      label: "仕事で使いたい" },
          { id: "kids",     label: "子どもの英語" },
          { id: "test",     label: "試験対策" },
          { id: "travel",   label: "海外旅行" },
          { id: "any",      label: "まだ決まっていない" },
        ],
      },
      {
        key: "level",
        question: "今の英語の感じに近いのは",
        options: [
          { id: "absolute", label: "ほぼ初めて" },
          { id: "basic",    label: "中学英語ぐらい" },
          { id: "convo",    label: "ある程度話せる" },
          { id: "confident",label: "自信あり" },
          { id: "unknown",  label: "自分でも分からない" },
        ],
      },
      {
        key: "pace",
        question: "学ぶペースは どれが近いですか",
        options: [
          { id: "weekly",   label: "週 1〜2 回 ゆっくり" },
          { id: "regular",  label: "週 3 回以上 安定的に" },
          { id: "intense",  label: "短期間で 集中して" },
          { id: "explore",  label: "まずは試してから" },
        ],
      },
      {
        key: "format",
        question: "受講スタイルの希望は",
        options: [
          { id: "online",   label: "オンライン" },
          { id: "person",   label: "対面" },
          { id: "either",   label: "どちらでも" },
        ],
      },
    ],
    result: {
      eyebrow: "ご提案",
      ctaTrial: "無料体験を予約",
      ctaReset: "もう一度 診断する",
      hint: "気になることはコンシェルジュへもどうぞ",
    },
  },
  en: {
    eyebrow: "Personal Guide",
    title: ["Find the shape", "of your path"],
    body: "Four short questions\nWe'll suggest the course that fits you",
    steps: [
      {
        key: "goal",
        question: "What would you most like to improve",
        options: [
          { id: "daily",    label: "Daily conversation" },
          { id: "biz",      label: "Business English" },
          { id: "kids",     label: "Kids English" },
          { id: "test",     label: "Test preparation" },
          { id: "travel",   label: "Travel English" },
          { id: "any",      label: "Not sure yet" },
        ],
      },
      {
        key: "level",
        question: "How would you describe your English",
        options: [
          { id: "absolute", label: "Just starting" },
          { id: "basic",    label: "Some basics" },
          { id: "convo",    label: "Conversational" },
          { id: "confident",label: "Confident" },
          { id: "unknown",  label: "Not sure" },
        ],
      },
      {
        key: "pace",
        question: "What pace fits you best",
        options: [
          { id: "weekly",   label: "1–2 times a week" },
          { id: "regular",  label: "3+ times a week" },
          { id: "intense",  label: "Intensive short-term" },
          { id: "explore",  label: "Try it first" },
        ],
      },
      {
        key: "format",
        question: "Which format would you prefer",
        options: [
          { id: "online",   label: "Online" },
          { id: "person",   label: "In-person" },
          { id: "either",   label: "Either is fine" },
        ],
      },
    ],
    result: {
      eyebrow: "Our suggestion",
      ctaTrial: "Book a free trial",
      ctaReset: "Start over",
      hint: "Talk to the concierge for anything else",
    },
  },
};

/** Map answers to one of three TSC courses + a short reason line. */
function recommend(answers, lang) {
  const { goal, level, pace, format } = answers;

  // Intensive short-term, or a confident learner — 30-lesson concentrated.
  if (pace === "intense" || level === "confident" || goal === "test") {
    return lang === "ja"
      ? {
          name: "30 回 集中コース",
          price: "¥26,000",
          unit: "レッスン 30 回分",
          reason: "短期間で確かに伸ばす\n試験や留学にも応えます",
        }
      : {
          name: "30-Lesson Intensive",
          price: "¥26,000",
          unit: "30 lessons",
          reason: "Move quickly and confidently\nstrong fit for tests and study abroad",
        };
  }

  // Regular cadence or business / kids — 20-lesson balance (most popular).
  if (
    pace === "regular" ||
    goal === "biz" ||
    goal === "kids" ||
    level === "convo" ||
    level === "basic"
  ) {
    return lang === "ja"
      ? {
          name: "20 回 コース",
          price: "¥19,000",
          unit: "レッスン 20 回分",
          reason: "続けやすいバランス\n習慣として身につけたい方へ",
        }
      : {
          name: "20-Lesson Course",
          price: "¥19,000",
          unit: "20 lessons",
          reason: "The balanced choice\nbest for building a learning habit",
        };
  }

  // Default — weekly or exploring — 10-lesson starter.
  return lang === "ja"
    ? {
        name: "10 回 コース",
        price: "¥10,000",
        unit: "レッスン 10 回分",
        reason: "気軽にはじめられる入口\nまずは TSC の空気感を",
      }
    : {
        name: "10-Lesson Course",
        price: "¥10,000",
        unit: "10 lessons",
        reason: "An easy first step\nfeel the rhythm of TSC",
      };
}

function loadSaved() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}
function saveState(s) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export default function LevelDiagnose() {
  const { lang } = useLang();
  const t = COPY[lang] || COPY.ja;
  const steps = t.steps;

  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  // Restore prior progress.
  useEffect(() => {
    const s = loadSaved();
    if (!s) return;
    if (s.answers) setAnswers(s.answers);
    if (typeof s.stepIdx === "number") setStepIdx(s.stepIdx);
    if (s.done) setDone(true);
  }, []);

  useEffect(() => {
    saveState({ stepIdx, answers, done });
  }, [stepIdx, answers, done]);

  const onPick = (key, value) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setAnswers({});
    setStepIdx(0);
    setDone(false);
  };

  const goTrial = () => {
    const el = document.getElementById("apply");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rec = done ? recommend(answers, lang) : null;
  const current = steps[stepIdx];

  return (
    <section id="path" className="relative overflow-hidden py-28 md:py-40">
      <div className="container-x relative z-[1] mx-auto max-w-3xl text-center">
        <Reveal>
          <SectionMark number="04" label="Path" />
        </Reveal>
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
            radius={54}
            push={11}
            intensity={0.8}
            className="display text-[clamp(2rem,1rem+3.4vw,3.8rem)]"
          />
        </div>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-[48ch] whitespace-pre-line font-body text-base text-ivory/60 md:text-lg">
            {t.body}
          </p>
        </Reveal>

        <Reveal delay={0.18} y={48}>
          <div className="relative mx-auto mt-14 max-w-2xl rounded-[28px] border border-white/12 bg-gradient-to-b from-white/[0.04] via-white/[0.015] to-transparent px-6 py-12 backdrop-blur-md shadow-[0_60px_140px_-30px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] md:px-10 md:py-14">
            {/* Inner gold trim */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 rounded-[20px] border border-gold/15"
            />

            {/* Stepper */}
            {!done && (
              <div className="relative mb-9 flex items-center justify-center gap-2">
                {steps.map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        i < stepIdx
                          ? "bg-gold"
                          : i === stepIdx
                          ? "bg-gold-bright shadow-[0_0_12px_2px_rgba(252,233,184,0.45)] scale-125"
                          : "bg-ivory/20"
                      }`}
                    />
                    {i < steps.length - 1 && (
                      <span
                        className={`h-px w-8 transition-colors duration-300 ${
                          i < stepIdx ? "bg-gold/40" : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {!done ? (
                <motion.div
                  key={`q-${stepIdx}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="relative text-center"
                >
                  <p className="font-display text-[clamp(1.2rem,1rem+1vw,1.6rem)] leading-snug text-ivory">
                    {current.question}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                    {current.options.map((opt) => {
                      const selected = answers[current.key] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onPick(current.key, opt.id)}
                          data-cursor
                          data-cursor-label="Pick"
                          className={`group relative rounded-full border px-4 py-2 font-sans text-[0.82rem] tracking-wide transition-all duration-300 ${
                            selected
                              ? "border-gold/55 bg-gold/15 text-gold-bright"
                              : "border-white/15 bg-white/[0.04] text-ivory/75 hover:border-gold/40 hover:bg-gold/[0.06] hover:text-ivory"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="relative text-center"
                >
                  <p className="font-sans text-[0.62rem] uppercase tracking-[0.42em] text-ivory/45">
                    {t.result.eyebrow}
                  </p>
                  <p className="mt-5 font-display text-[clamp(1.8rem,1rem+2.6vw,3rem)] leading-tight text-gold-bright">
                    {rec.name}
                  </p>
                  <p className="mt-2 font-sans text-sm tracking-wide text-ivory/55">
                    {rec.price}  ·  {rec.unit}
                  </p>
                  <p className="mx-auto mt-6 max-w-[36ch] whitespace-pre-line font-body text-[1rem] leading-relaxed text-ivory/75">
                    {rec.reason}
                  </p>

                  <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={goTrial}
                      data-cursor
                      data-cursor-label="Book"
                      className="inline-flex items-center gap-2.5 rounded-full border border-gold/45 bg-gradient-to-br from-gold-bright/20 to-gold/5 px-6 py-3 font-sans text-sm tracking-wide text-gold-bright transition-all duration-300 hover:from-gold-bright/30 hover:to-gold/10 hover:shadow-[0_0_40px_-8px_rgba(216,184,106,0.6)]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-bright" />
                      {t.result.ctaTrial}
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      data-cursor
                      data-cursor-label="Again"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 font-sans text-sm tracking-wide text-ivory/70 transition-colors duration-300 hover:border-white/30 hover:text-ivory"
                    >
                      {t.result.ctaReset}
                    </button>
                  </div>

                  <p className="mt-6 font-sans text-[0.66rem] uppercase tracking-[0.34em] text-ivory/40">
                    {t.result.hint}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
