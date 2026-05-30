import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { content } from "../content";
import { useLang } from "../lib/lang";
import LetterBurst from "../components/LetterBurst";
import Reveal from "../components/Reveal";
import SectionMark from "../components/SectionMark";
import SectionBg from "../components/SectionBg";

function Item({ q, a, open, onToggle }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
        open ? "border-gold/40 bg-gold/[0.05]" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        data-cursor
        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
      >
        <span className="display text-lg text-ivory">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} className="flex-none text-gold">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="whitespace-pre-line px-6 pb-6 font-body text-[0.96rem] leading-relaxed text-ivory/60">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const { lang } = useLang();
  const t = content[lang].faq;
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="relative overflow-hidden py-28 md:py-40">
      <div className="container-x max-w-3xl">
        <div className="mb-14 text-center">
          <Reveal><SectionMark number="05" label="Questions" /></Reveal>
          <Reveal>
            <p className="eyebrow mb-5">{t.eyebrow}</p>
          </Reveal>
          <LetterBurst as="h2" lines={t.title} play radius={50} push={9} intensity={0.75} className="display text-[clamp(2rem,1rem+3vw,3.4rem)]" />
          <Reveal delay={0.1}>
            <p className="mt-5 font-body text-base text-ivory/55 md:text-lg">{t.sub}</p>
          </Reveal>
        </div>

        <div className="grid gap-3">
          {t.items.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.06}>
              <Item q={item.q} a={item.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
