import { content, FORM_URL } from "../content";
import { useLang } from "../lib/lang";
import LetterBurst from "../components/LetterBurst";
import Reveal from "../components/Reveal";
import SectionMark from "../components/SectionMark";

export default function Apply() {
  const { lang } = useLang();
  const t = content[lang].apply;

  return (
    <section id="apply" className="relative overflow-hidden py-28 md:py-40">
      {/* Particles handled globally. A soft top-anchored vignette stays so
          the white form iframe doesn't sit on bare marble. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[0]"
        style={{
          background:
            "radial-gradient(70% 50% at 50% 18%, rgba(5,6,10,0.4) 0%, rgba(5,6,10,0.2) 50%, rgba(5,6,10,0) 80%)",
        }}
      />

      <div className="container-x relative z-[1] max-w-3xl text-center">
        <Reveal><SectionMark number="08" label="Application" /></Reveal>
        <Reveal>
          <p className="eyebrow mb-5">{t.eyebrow}</p>
        </Reveal>
        <div style={{ textShadow: "0 2px 24px rgba(5,6,10,0.7)" }}>
          <LetterBurst as="h2" lines={t.title} play radius={56} push={11} intensity={0.85} className="display text-[clamp(2rem,1rem+3vw,3.6rem)]" />
        </div>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-5 max-w-[48ch] whitespace-pre-line font-body text-base text-ivory/60 md:text-lg">{t.sub}</p>
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
