import { content, FORM_URL } from "../content";
import { useLang } from "../lib/lang";
import SplitReveal from "../components/SplitReveal";
import Reveal from "../components/Reveal";
import SectionBg from "../components/SectionBg";

export default function Apply() {
  const { lang } = useLang();
  const t = content[lang].apply;

  return (
    <section id="apply" className="relative overflow-hidden py-28 md:py-40">
      <SectionBg src="marble.jpg" opacity={0.42} scrim={0.66} />
      <div className="container-x max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow mb-5">{t.eyebrow}</p>
        </Reveal>
        <SplitReveal as="h2" lines={t.title} className="display text-[clamp(2rem,1rem+3vw,3.6rem)] text-ivory" />
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-[48ch] font-body text-base text-ivory/55 md:text-lg">{t.sub}</p>
        </Reveal>

        <Reveal delay={0.15} y={48}>
          <div className="mt-12 overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
            <iframe
              src={FORM_URL}
              title="TSC English Academy Application Form"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-[1500px] w-full rounded-[18px] bg-white"
            >
              Loading…
            </iframe>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
