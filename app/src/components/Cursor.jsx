import { useEffect, useRef, useState } from "react";
import { isTouch } from "../lib/env";

/**
 * Custom cursor: a crisp center dot + a larger lag-following ring.
 * Scales up and shows a label over elements marked with [data-cursor].
 * Disabled on touch devices.
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (isTouch) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let raf;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const tick = () => {
      ring.x += (target.x - ring.x) * 0.18;
      ring.y += (target.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e) => {
      const el = e.target.closest?.("[data-cursor], a, button");
      if (el) {
        setHovering(true);
        setLabel(el.getAttribute?.("data-cursor-label") || "");
      }
    };
    const onOut = (e) => {
      const el = e.target.closest?.("[data-cursor], a, button");
      if (el) {
        setHovering(false);
        setLabel("");
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (isTouch) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden md:block" aria-hidden="true">
      <div
        ref={dotRef}
        className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-gold-bright"
        style={{ mixBlendMode: "difference" }}
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-gold/70 transition-[width,height,background-color,border-color] duration-300 ease-out"
        style={{
          width: hovering ? 64 : 34,
          height: hovering ? 64 : 34,
          marginLeft: hovering ? -32 : -17,
          marginTop: hovering ? -32 : -17,
          backgroundColor: hovering ? "rgba(216,184,106,0.12)" : "transparent",
        }}
      >
        {label && (
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-gold-bright">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
