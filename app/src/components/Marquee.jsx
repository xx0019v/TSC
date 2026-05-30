/**
 * Counter-scrolling double marquee band — two rows moving in opposite
 * directions create kinetic depth (a motif from premium JP sites like
 * spiral-cap and emberz). Primary row is bold gold-on-dark display type;
 * secondary row is a finer ivory tracking line.
 */
function Row({ items, duration, reverse = false, variant = "primary" }) {
  const isPrimary = variant === "primary";
  const row = (
    <ul className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((t, i) => (
        <li key={i} className="flex items-center gap-10 whitespace-nowrap">
          {isPrimary ? (
            <span className="font-display text-[clamp(1.5rem,1rem+2.2vw,2.6rem)] text-ivory/90">{t}</span>
          ) : (
            <span className="font-sans text-[0.78rem] uppercase tracking-[0.42em] text-ivory/55">{t}</span>
          )}
          <span className={`h-1.5 w-1.5 rounded-full ${isPrimary ? "bg-gold" : "bg-gold/55"}`} aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className={`flex w-max will-change-transform ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}
      style={{ animationDuration: `${duration}s` }}
    >
      {row}
      {row}
    </div>
  );
}

export default function Marquee({
  items = [],
  secondary,
  duration = 28,
  className = "",
}) {
  // Default secondary: short rhythmic phrases that complement the primary line.
  const sec =
    secondary && secondary.length
      ? secondary
      : ["online english", "tokyo · worldwide", "speak with confidence", "since 2024", "by your side"];
  return (
    <div className={`relative overflow-hidden border-y border-white/10 ${className}`} aria-hidden="true">
      <div className="py-6">
        <Row items={items} duration={duration} variant="primary" />
      </div>
      <div className="border-t border-white/5 py-3">
        <Row items={sec} duration={duration * 0.7} variant="secondary" reverse />
      </div>
    </div>
  );
}
