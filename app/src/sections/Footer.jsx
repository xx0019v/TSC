import { content, BRAND, CONTACT_EMAIL, nav } from "../content";
import { useLang } from "../lib/lang";

/**
 * Footer — editorial closing spread. A thin gold rule meets the brand mark
 * meets the tagline meets the navigation meets the colophon. Generous
 * vertical rhythm, no boxes, no buttons — just a calm farewell.
 */
export default function Footer() {
  const { lang } = useLang();
  const t = content[lang].footer;
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="relative pb-14 pt-24">
      {/* Top rule — fades in from each edge, a magazine-style closing line. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-gold/40 to-transparent"
      />

      <div className="container-x flex flex-col items-center gap-7 text-center">
        {/* Wordmark + small star centred above */}
        <div className="flex flex-col items-center gap-3">
          <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-gold/60" />
          <span className="font-display text-xl tracking-[0.24em] text-gold-bright md:text-[1.4rem]">
            {BRAND}
          </span>
        </div>

        <p className="max-w-[40ch] whitespace-pre-line font-body text-sm leading-relaxed text-ivory/50">
          {t.tagline}
        </p>

        {/* Nav — fine type with gold underline on hover */}
        <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                data-cursor
                className="font-sans text-[0.82rem] tracking-wide text-ivory/60 transition-colors duration-300 hover:text-gold-bright"
              >
                {item[lang]}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#apply"
              data-cursor
              className="font-sans text-[0.82rem] tracking-wide text-gold-bright/85 transition-colors duration-300 hover:text-gold-bright"
            >
              {content[lang].cta.start}
            </a>
          </li>
        </ul>

        {/* Contact line */}
        <p className="font-body text-[0.86rem] text-ivory/55">
          {t.contact}{" — "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            data-cursor
            className="text-gold transition-colors duration-300 hover:text-gold-bright"
          >
            {CONTACT_EMAIL}
          </a>
        </p>

        {/* Mid rule */}
        <div
          aria-hidden="true"
          className="my-1 h-px w-24 bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        {/* Colophon */}
        <p className="font-sans text-[0.62rem] uppercase tracking-[0.38em] text-ivory/30">
          Tokyo · Worldwide · est. 2024
        </p>
        <p className="font-sans text-[0.62rem] tracking-[0.18em] text-ivory/25">
          © {year} {BRAND}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
