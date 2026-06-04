import { useEffect, useRef } from "react";

/**
 * Counter-scrolling double marquee band — two rows moving in opposite
 * directions create kinetic depth (a motif from premium JP sites like
 * spiral-cap and emberz). Primary row is bold gold-on-dark display type;
 * secondary row is a finer ivory tracking line.
 *
 * Scroll-velocity reactive: when the page scrolls quickly, the marquee
 * animation briefly accelerates and then eases back to its rest tempo.
 * The world reacts to the visitor — Active-Theory feel without the
 * heavyweight WebGL.
 */
function Row({ items, durationVar, reverse = false, variant = "primary", innerRef }) {
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
      ref={innerRef}
      className={`flex w-max will-change-transform ${reverse ? "animate-marquee-rev" : "animate-marquee"}`}
      style={{ animationDuration: `var(${durationVar})` }}
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
  const sec =
    secondary && secondary.length
      ? secondary
      : ["online english", "tokyo · worldwide", "speak with confidence", "since 2024", "by your side"];

  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const primaryRest = duration;
    const secondaryRest = duration * 0.7;
    // Live durations interpolated toward rest each frame.
    let primaryDur = primaryRest;
    let secondaryDur = secondaryRest;
    // Boost (0..1) controlled by recent scroll velocity.
    let boost = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();

    wrap.style.setProperty("--mq-primary", `${primaryDur}s`);
    wrap.style.setProperty("--mq-secondary", `${secondaryDur}s`);

    let raf;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { threshold: 0 });
    io.observe(wrap);

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(16, now - lastTime);
      const vy = Math.abs(window.scrollY - lastY) / dt; // px/ms
      lastY = window.scrollY;
      lastTime = now;
      // Above ~1.0 px/ms feels "fast"; clamp boost to [current, 1].
      const v = Math.min(1, vy * 0.9);
      if (v > boost) boost = v;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      if (visible && !document.hidden) {
        // Boost decays toward 0 at ~3s.
        boost *= 0.94;
        // Faster animation = shorter duration. Boost 1 → 0.45×, boost 0 → 1×.
        const factor = 1 - boost * 0.55;
        primaryDur = primaryRest * factor;
        secondaryDur = secondaryRest * factor;
        wrap.style.setProperty("--mq-primary", `${primaryDur.toFixed(2)}s`);
        wrap.style.setProperty("--mq-secondary", `${secondaryDur.toFixed(2)}s`);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [duration]);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden border-y border-white/10 ${className}`}
      aria-hidden="true"
    >
      <div className="py-6">
        <Row items={items} durationVar="--mq-primary" variant="primary" />
      </div>
      <div className="border-t border-white/5 py-3">
        <Row items={sec} durationVar="--mq-secondary" variant="secondary" reverse />
      </div>
    </div>
  );
}
