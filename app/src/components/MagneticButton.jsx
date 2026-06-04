import { useRef } from "react";
import { gsap } from "../lib/gsap";
import { isTouch } from "../lib/env";

/**
 * A button/link that magnetically drifts toward the pointer, then springs back.
 * Variants: "primary" (gold fill) | "ghost" (outline).
 */
export default function MagneticButton({
  as = "a",
  href = "#",
  children,
  variant = "primary",
  label = "",
  className = "",
  onClick,
}) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);

  const handleMove = (e) => {
    if (isTouch || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    gsap.to(wrapRef.current, { x: x * 0.35, y: y * 0.35, duration: 0.6, ease: "power3.out" });
    gsap.to(innerRef.current, { x: x * 0.15, y: y * 0.15, duration: 0.6, ease: "power3.out" });
  };

  const handleLeave = () => {
    if (!wrapRef.current) return;
    gsap.to([wrapRef.current, innerRef.current], { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  };

  const base =
    "group relative inline-flex items-center justify-center overflow-visible rounded-full px-7 py-3.5 text-sm font-medium font-sans tracking-wide select-none transition-shadow duration-500";
  const styles =
    variant === "primary"
      ? "text-void bg-gradient-to-br from-gold-bright via-gold to-gold-deep shadow-[0_10px_40px_-8px_rgba(216,184,106,0.55)] hover:shadow-[0_18px_60px_-10px_rgba(252,233,184,0.7),0_0_0_1px_rgba(252,233,184,0.18)]"
      : "text-ivory border border-white/15 bg-white/[0.03] hover:border-gold/55 hover:bg-white/[0.06]";

  const Tag = as;

  return (
    <Tag
      ref={wrapRef}
      href={as === "a" ? href : undefined}
      onClick={onClick}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      data-cursor
      data-cursor-label={label}
      className={`${base} ${styles} ${className}`}
    >
      {/* Expanding gold ring on hover — primary only. The pointer-events-none
          ring sits OUTSIDE the pill so the magnetic pull still feels precise. */}
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-full border border-gold-bright/0 opacity-0 transition-all duration-500 group-hover:-inset-2 group-hover:border-gold-bright/35 group-hover:opacity-100"
        />
      )}
      <span ref={innerRef} className="relative inline-flex items-center gap-2">
        {children}
      </span>
    </Tag>
  );
}
