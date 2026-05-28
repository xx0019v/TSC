import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { prefersReduced } from "../lib/env";

/**
 * Animated number that counts up from 0 to `value` when scrolled into view.
 * `prefix`/`suffix` wrap the number (e.g. suffix "%+", "名").
 */
export default function CountUp({ value, prefix = "", suffix = "", duration = 1400, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [n, setN] = useState(prefersReduced ? value : 0);

  useEffect(() => {
    if (!inView || prefersReduced) return;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{n}{suffix}
    </span>
  );
}
