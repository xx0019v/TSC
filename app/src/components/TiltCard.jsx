import { useRef } from "react";
import { isTouch } from "../lib/env";

/**
 * TiltCard — wraps any card so the cursor's position within it bows the
 * card a few degrees on the X and Y axes, with a soft gold-tinted
 * highlight following the cursor. Returns to neutral on leave with a
 * 600ms ease.
 *
 * The tilt is intentionally small (max ±4°) so the surface still reads
 * as a paper-stiff editorial card, not a toy. Touch devices skip the
 * effect entirely.
 *
 * Pattern: Linear / Vercel / Pentagram.
 */
export default function TiltCard({
  as = "div",
  children,
  maxTilt = 4,
  className = "",
  innerClassName = "",
  ...rest
}) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const sheenRef = useRef(null);

  const onMove = (e) => {
    if (isTouch || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;   // 0..1
    const py = (e.clientY - rect.top) / rect.height;   // 0..1
    const rx = (0.5 - py) * maxTilt * 2;                // tilt X
    const ry = (px - 0.5) * maxTilt * 2;                // tilt Y
    if (innerRef.current) {
      innerRef.current.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    }
    if (sheenRef.current) {
      sheenRef.current.style.background = `radial-gradient(220px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(252,233,184,0.10), transparent 70%)`;
      sheenRef.current.style.opacity = "1";
    }
  };

  const onLeave = () => {
    if (innerRef.current) {
      innerRef.current.style.transition = "transform 600ms cubic-bezier(0.16,1,0.3,1)";
      innerRef.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      window.setTimeout(() => {
        if (innerRef.current) innerRef.current.style.transition = "";
      }, 620);
    }
    if (sheenRef.current) sheenRef.current.style.opacity = "0";
  };

  const Tag = as;

  return (
    <Tag
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      {...rest}
    >
      <div
        ref={innerRef}
        className={`relative h-full w-full will-change-transform ${innerClassName}`}
        style={{ transformStyle: "preserve-3d", transition: "transform 80ms linear" }}
      >
        {children}
        {/* Cursor-following sheen. Disabled (opacity 0) at rest. */}
        <div
          ref={sheenRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
        />
      </div>
    </Tag>
  );
}
