import { content } from "../content";
import { useLang } from "../lib/lang";
import LetterBurst from "../components/LetterBurst";
import Reveal from "../components/Reveal";
import MagneticButton from "../components/MagneticButton";
import SectionMark from "../components/SectionMark";
import SectionBg from "../components/SectionBg";

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 flex-none text-gold" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function Pricing() {
  const { lang } = useLang();
  const t = content[lang].pricing;

  return (
    <section id="pricing" className="relative overflow-hidden py-28 md:py-40">
      <div className="container-x">
        <div className="mb-14 max-w-2xl">
          <Reveal><SectionMark number="04" label="Pricing" align="left" /></Reveal>
          <Reveal>
            <p className="eyebrow mb-5">{t.eyebrow}</p>
          </Reveal>
          <LetterBurst as="h2" lines={t.title} play radius={50} push={9} intensity={0.75} className="display text-[clamp(2rem,1rem+3vw,3.4rem)]" />
          <Reveal delay={0.1}>
            <p className="mt-5 font-body text-base text-ivory/55 md:text-lg">{t.sub}</p>
          </Reveal>
        </div>

        {/* standard rate */}
        <Reveal>
          <div className="mb-10 flex flex-wrap items-center justify-between gap-6 rounded-[22px] border border-gold/25 bg-gold/[0.07] px-8 py-7">
            <div>
              <div className="font-sans text-xs uppercase tracking-[0.2em] text-ivory/55">{t.standard.label}</div>
              <div className="display mt-1 text-[clamp(2.2rem,1.4rem+2.5vw,3.2rem)] leading-none text-gold-bright">
                {t.standard.amount}
                <span className="ml-2 align-middle font-body text-base text-ivory/55">{t.standard.unit}</span>
              </div>
            </div>
            <MagneticButton href="#apply" variant="ghost" label="Book" className="text-sm">
              {content[lang].cta.trial}
            </MagneticButton>
          </div>
        </Reveal>

        {/* plans */}
        <div className="grid gap-5 md:grid-cols-3">
          {t.plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <article
                data-cursor
                className={`relative flex h-full flex-col overflow-hidden rounded-[22px] p-8 ${
                  p.featured
                    ? "border border-gold/60 bg-gold/[0.1] shadow-[0_20px_60px_-20px_rgba(216,184,106,0.5)]"
                    : "glass"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-br from-gold-bright to-gold px-4 py-1 font-sans text-[0.66rem] font-semibold uppercase tracking-wider text-void">
                    {p.tag}
                  </span>
                )}
                <div className="font-sans text-xs uppercase tracking-[0.14em] text-gold-bright">{p.name}</div>
                <div className="display mt-4 text-[2.6rem] leading-none text-ivory">{p.price}</div>
                <div className="mt-1 font-body text-sm text-ivory/45">{p.unit}</div>
                <div className="mt-5 inline-block w-fit rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-sans text-sm text-emerald-300">
                  {p.save}
                </div>
                <ul className="mt-6 grid gap-2.5">
                  {p.list.map((li) => (
                    <li key={li} className="flex gap-2.5 font-body text-[0.92rem] text-ivory/65">
                      <Check /> {li}
                    </li>
                  ))}
                </ul>
                <div className="mt-7 pt-2">
                  <MagneticButton
                    href="#apply"
                    variant={p.featured ? "primary" : "ghost"}
                    label="Apply"
                    className="w-full text-sm"
                  >
                    {t.choose}
                  </MagneticButton>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* credit + payment */}
        <div className="mt-10 grid gap-5 md:grid-cols-12">
          <Reveal className="md:col-span-7" delay={0.05}>
            <div className="h-full rounded-[22px] glass p-8">
              <h3 className="display text-xl text-gold-bright">{t.credit.title}</h3>
              <p className="mt-3 font-body text-[0.96rem] leading-relaxed text-ivory/60">{t.credit.body}</p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {t.credit.items.map((li) => (
                  <li key={li} className="flex gap-2.5 font-body text-[0.92rem] text-ivory/70">
                    <Check /> {li}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal className="md:col-span-5" delay={0.1}>
            <div className="h-full rounded-[22px] glass p-8">
              <h3 className="display text-xl text-gold-bright">{t.payment.title}</h3>
              <ul className="mt-5 grid gap-2.5">
                {t.payment.items.map((li) => (
                  <li key={li} className="flex gap-2.5 font-body text-[0.92rem] text-ivory/70">
                    <Check /> {li}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-10 text-center font-body text-sm text-ivory/40">{t.note}</p>
        </Reveal>
      </div>
    </section>
  );
}
