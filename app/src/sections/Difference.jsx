import { content } from "../content";
import { useLang } from "../lib/lang";
import SplitReveal from "../components/SplitReveal";
import Reveal from "../components/Reveal";
import SectionBg from "../components/SectionBg";

export default function Difference() {
  const { lang } = useLang();
  const t = content[lang].difference;

  return (
    <section id="difference" className="relative overflow-hidden py-28 md:py-40">
      <SectionBg src="marble.jpg" opacity={0.42} scrim={0.66} />
      <div className="container-x grid items-center gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-7">
          <Reveal>
            <p className="eyebrow mb-6">{t.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mb-5 flex items-center gap-4 font-display text-[clamp(1.4rem,1rem+2vw,2.4rem)] text-ivory">
              <span>{t.versus[0]}</span>
              <span className="italic text-gold">×</span>
              <span>{t.versus[1]}</span>
            </div>
          </Reveal>
          <SplitReveal
            as="h2"
            lines={t.title}
            gold={1}
            className="display text-[clamp(1.9rem,1rem+3vw,3.2rem)] text-ivory"
          />
          <Reveal delay={0.1}>
            <p className="mt-7 max-w-[52ch] font-body text-base leading-relaxed text-ivory/65 md:text-lg">
              {t.body}
            </p>
          </Reveal>

          <ul className="mt-10 grid gap-6">
            {t.points.map((p, i) => (
              <Reveal key={p.title} delay={0.1 + i * 0.08}>
                <li className="flex gap-4">
                  <span className="mt-1 grid h-9 w-9 flex-none place-items-center rounded-xl border border-gold/30 bg-gold/10 font-sans text-sm text-gold">
                    {String(i + 1)}
                  </span>
                  <div>
                    <h4 className="font-sans text-base font-medium text-ivory">{p.title}</h4>
                    <p className="mt-1 font-body text-[0.96rem] leading-relaxed text-ivory/55">{p.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* stat panel */}
        <div className="md:col-span-5">
          <Reveal delay={0.15} y={48}>
            <div className="relative overflow-hidden rounded-[26px] border border-white/10 p-9">
              {/* marble texture + scrim for a luxe, readable surface */}
              <img
                src={`${import.meta.env.BASE_URL}marble.jpg`}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(155deg, rgba(216,184,106,0.12), rgba(5,6,10,0.8) 62%)" }}
              />
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(252,233,184,0.25), transparent 70%)" }}
              />
              <div className="relative grid gap-8">
                {t.stats.map((s) => (
                  <div key={s.label}>
                    <div className="display text-[clamp(2.6rem,2rem+3vw,4rem)] leading-none text-gold-bright">
                      {s.num}
                    </div>
                    <div className="mt-2 font-sans text-sm tracking-wide text-ivory/55">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
