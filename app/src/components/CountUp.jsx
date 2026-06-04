import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { prefersReduced } from "../lib/env";

/**
 * CountUp — animated number that counts up to `value` when scrolled into
 * view. Two-phase reveal: a quick numeric scramble at the start (Apple
 * Card / Watch micro-pattern) settles into the eased ascent, then locks
 * to the target.
 *
 * `prefix` / `suffix` wrap the number (e.g. suffix "%+", "名").
 */
export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1400,
  scrambleMs = 380,
  className = "",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [n, setN] = useState(prefersReduced ? value : 0);

  useEffect(() => {
    if (!inView || prefersReduced) return;
    let raf;
    const start = performance.now();
    const targetDigits = Math.max(1, String(Math.round(value)).length);
    const maxScramble = Math.pow(10, targetDigits) - 1;

    const tick = (t) => {
      const elapsed = t - start;
      if (elapsed < scrambleMs) {
        // Random scramble within the same digit width.
        setN(Math.floor(Math.random() * maxScramble));
        raf = requestAnimationFrame(tick);
        return;
      }
      const p = Math.min(1, (elapsed - scrambleMs) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, scrambleMs]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <span className="tabular-nums">{n}</span>
      {suffix}
    </span>
  );
}
