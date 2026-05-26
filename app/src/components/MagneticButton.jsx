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
    "relative inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-medium font-sans tracking-wide select-none";
  const styles =
    variant === "primary"
      ? "text-void bg-gradient-to-br from-gold-bright via-gold to-gold-deep shadow-[0_10px_40px_-8px_rgba(216,184,106,0.6)]"
      : "text-ivory border border-white/15 bg-white/[0.03] hover:border-gold/50";

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
      <span ref={innerRef} className="inline-flex items-center gap-2">
        {children}
      </span>
    </Tag>
  );
}
