import { content, BRAND, CONTACT_EMAIL, nav } from "../content";
import { useLang } from "../lib/lang";

export default function Footer() {
  const { lang } = useLang();
  const t = content[lang].footer;
  const year = new Date().getFullYear();

  return (
    <footer id="footer" className="relative border-t border-white/10 py-16">
      <div className="container-x flex flex-col items-center gap-6 text-center">
        <div className="display text-xl tracking-[0.12em] text-gold-bright">{BRAND}</div>
        <p className="font-body text-sm text-ivory/45">{t.tagline}</p>

        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href} data-cursor className="font-sans text-sm text-ivory/55 transition-colors hover:text-gold-bright">
                {item[lang]}
              </a>
            </li>
          ))}
          <li>
            <a href="#apply" data-cursor className="font-sans text-sm text-ivory/55 transition-colors hover:text-gold-bright">
              {content[lang].cta.start}
            </a>
          </li>
        </ul>

        <p className="font-body text-sm text-ivory/55">
          {t.contact}:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} data-cursor className="text-gold transition-colors hover:text-gold-bright">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="font-sans text-xs tracking-[0.16em] text-ivory/30">
          © {year} {BRAND}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
