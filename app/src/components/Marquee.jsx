/**
 * Infinite horizontal marquee band (CSS-driven, GPU-friendly).
 * `items` = array of strings; rendered twice for a seamless loop.
 */
export default function Marquee({ items = [], duration = 28, className = "" }) {
  const row = (
    <ul className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((t, i) => (
        <li key={i} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-display text-[clamp(1.4rem,1rem+2vw,2.4rem)] text-ivory/90">{t}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`relative overflow-hidden border-y border-white/10 py-7 ${className}`} aria-hidden="true">
      <div className="flex w-max animate-marquee will-change-transform" style={{ animationDuration: `${duration}s` }}>
        {row}
        {row}
      </div>
    </div>
  );
}
