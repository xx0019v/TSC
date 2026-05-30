/**
 * Editorial chapter mark — a large gold numeral and a thin rule that
 * introduces a section the way a print magazine numbers its features.
 * Use it at the top of each section above the eyebrow.
 *
 *   <SectionMark number="01" label="Difference" />
 */
export default function SectionMark({ number, label, align = "center" }) {
  const justify = align === "left" ? "items-start" : align === "right" ? "items-end" : "items-center";
  return (
    <div className={`flex ${justify} mb-6 flex-col gap-3`} aria-hidden="true">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[clamp(1.6rem,1rem+1.4vw,2.4rem)] leading-none text-gold/85">{number}</span>
        <span className="h-px w-12 -translate-y-2 bg-gold/40 md:w-20" />
        <span className="font-sans text-[0.62rem] uppercase tracking-[0.45em] text-ivory/55">{label}</span>
      </div>
    </div>
  );
}
