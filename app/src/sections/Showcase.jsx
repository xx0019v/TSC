import { content } from "../content";
import { useLang } from "../lib/lang";
import LetterBurst from "../components/LetterBurst";
import Reveal from "../components/Reveal";
import Parallax from "../components/Parallax";
import SectionMark from "../components/SectionMark";

function Frame({ src, label, className = "", aspect, speed = 0.12 }) {
  return (
    <Reveal className={className} y={48}>
      <figure
        data-cursor
        data-cursor-label="View"
        className="group relative h-full overflow-hidden rounded-[20px] border border-white/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-gold/30 hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6),0_0_50px_-18px_rgba(216,184,106,0.35)]"
        style={aspect ? { aspectRatio: aspect } : undefined}
      >
        {/* Oversized inner layer so the parallax drift never exposes an edge. */}
        <Parallax speed={speed} className="absolute inset-x-0 -top-[16%] h-[132%]">
          <img
            src={`${import.meta.env.BASE_URL}${src}`}
            alt={label}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
        </Parallax>
        {/* Cursor-following sheen on hover, sub-zero z so the caption stays
            on top. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(60% 60% at 50% 30%, rgba(252,233,184,0.08), transparent 70%)" }}
        />
        <figcaption className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-void/85 via-void/30 to-transparent p-5">
          <span className="block font-sans text-sm tracking-wide text-ivory/90 transition-colors duration-500 group-hover:text-gold-bright">{label}</span>
          {/* Thin gold rule that draws in on hover. */}
          <span className="mt-2 block h-px w-0 origin-left bg-gradient-to-r from-gold via-gold-bright to-transparent transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-12" />
        </figcaption>
      </figure>
    </Reveal>
  );
}

export default function Showcase() {
  const { lang } = useLang();
  const t = content[lang].showcase;

  return (
    <section id="showcase" className="section relative overflow-hidden">
      <div className="container-x grid items-center gap-10 md:grid-cols-12 md:gap-14">
        {/* Left: editorial text */}
        <div className="md:col-span-4">
          <Reveal><SectionMark number="03" label="Showcase" align="left" /></Reveal>
          <Reveal>
            <p className="eyebrow mb-6">{t.eyebrow}</p>
          </Reveal>
          <LetterBurst
            as="h2"
            lines={t.title}
            goldLine={1}
            play
            radius={50}
            push={9}
            intensity={0.75}
            className="display text-[clamp(1.9rem,1rem+2.6vw,3rem)]"
          />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[42ch] whitespace-pre-line font-body text-base leading-relaxed text-ivory/65">
              {t.body}
            </p>
          </Reveal>
        </div>

        {/* Right: asymmetric image grid */}
        <div className="grid grid-cols-2 gap-4 md:col-span-8 md:gap-5" style={{ gridAutoRows: "minmax(0, 1fr)" }}>
          <Frame src={t.items[0].src} label={t.items[0].label} className="row-span-2" speed={0.18} />
          <Frame src={t.items[1].src} label={t.items[1].label} aspect="4 / 3" speed={0.1} />
          <Frame src={t.items[2].src} label={t.items[2].label} aspect="4 / 3" speed={0.14} />
        </div>
      </div>
    </section>
  );
}
