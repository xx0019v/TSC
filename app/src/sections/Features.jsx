import { content } from "../content";
import { useLang } from "../lib/lang";
import Reveal from "../components/Reveal";
import SectionMark from "../components/SectionMark";
import SectionBg from "../components/SectionBg";

export default function Features() {
  const { lang } = useLang();
  const t = content[lang].features;

  return (
    <section id="features" className="relative overflow-hidden py-28 md:py-40">
      <div className="container-x">
        <div className="mb-16 max-w-2xl">
          <Reveal><SectionMark number="02" label="Lessons" align="left" /></Reveal>
          <Reveal>
            <p className="eyebrow mb-5">{t.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="display text-[clamp(2rem,1rem+3vw,3.4rem)] text-ivory">{t.title}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-[52ch] font-body text-base text-ivory/55 md:text-lg">{t.sub}</p>
          </Reveal>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {t.items.map((item, i) => (
            <Reveal key={item.no} delay={i * 0.1}>
              <article
                data-cursor
                className="group relative h-full overflow-hidden rounded-[22px] glass p-8 transition-colors duration-500 hover:border-gold/40"
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "radial-gradient(circle, rgba(216,184,106,0.35), transparent 70%)" }}
                />
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm tracking-[0.2em] text-gold/70">{item.no}</span>
                  <span className="rounded-full border border-gold/25 bg-gold/[0.08] px-3 py-1 font-sans text-[0.66rem] uppercase tracking-wider text-gold-bright">
                    {item.tag}
                  </span>
                </div>
                <h3 className="display mt-7 text-2xl text-ivory">{item.title}</h3>
                <p className="mt-3 font-body text-[0.98rem] leading-relaxed text-ivory/60">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
