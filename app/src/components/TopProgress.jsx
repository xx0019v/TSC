import { useEffect, useRef } from "react";

/**
 * TopProgress — a 1px-tall horizontal champagne line at the very top of
 * the viewport that fills left → right as the visitor scrolls the page.
 *
 * Familiar from Stripe / Vercel / Apple — a quiet "you are here in this
 * story" marker that lives above the navbar without competing for
 * attention. Pure DOM update on scroll; no RAF chain, no React state.
 */
export default function TopProgress() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let pending = false;
    const update = () => {
      pending = false;
      const h = document.documentElement;
      const max = Math.max(1, h.scrollHeight - window.innerHeight);
      const y = window.scrollY || h.scrollTop || 0;
      const p = Math.max(0, Math.min(1, y / max));
      el.style.transform = `scaleX(${p.toFixed(4)})`;
    };
    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-px overflow-hidden bg-transparent"
    >
      <div
        ref={ref}
        className="h-px w-full origin-left bg-gradient-to-r from-gold-bright via-gold to-gold-deep shadow-[0_0_10px_rgba(216,184,106,0.6)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
