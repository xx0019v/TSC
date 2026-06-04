import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BRAND, nav, content } from "../content";
import { useLang } from "../lib/lang";
import MagneticButton from "./MagneticButton";

export default function Navbar({ show }) {
  const { lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const t = content[lang];

  useEffect(() => {
    const onScroll = () => setScrolled((window.scrollY || 0) > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "border-b border-white/10 bg-void/65 backdrop-blur-xl" : "border-b border-transparent"
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={show ? { y: 0, opacity: 1 } : { y: -80, opacity: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      <nav className="container-x flex h-16 items-center justify-between md:h-[72px]">
        <a href="#hero" data-cursor className="flex items-center gap-3" aria-label="TSC English Academy — home">
          <img
            src={`${import.meta.env.BASE_URL}logo.webp`}
            alt=""
            aria-hidden="true"
            width="40"
            height="40"
            className="h-9 w-9 rounded-lg object-cover ring-1 ring-gold/40 md:h-10 md:w-10"
          />
          <span className="display text-base tracking-[0.14em] text-ivory md:text-lg">
            TSC <span className="text-gold">English Academy</span>
          </span>
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                data-cursor
                className="font-sans text-sm text-ivory/60 transition-colors hover:text-ivory"
              >
                {item[lang]}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {/* JA / EN toggle */}
          <div className="flex rounded-full border border-white/10 bg-white/[0.05] p-1">
            {["ja", "en"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                data-cursor
                className={`h-8 w-10 rounded-full font-sans text-xs font-medium uppercase tracking-wider transition-colors ${
                  lang === l ? "bg-gradient-to-br from-gold-bright to-gold text-void" : "text-ivory/55 hover:text-ivory"
                }`}
                aria-pressed={lang === l}
              >
                {l}
              </button>
            ))}
          </div>

          <MagneticButton href="#apply" variant="primary" label="Go" className="hidden !px-5 !py-2.5 text-xs sm:inline-flex">
            {t.cta.start}
          </MagneticButton>
        </div>
      </nav>
    </motion.header>
  );
}
