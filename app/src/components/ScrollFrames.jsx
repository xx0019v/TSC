import { useEffect, useRef } from "react";
import { fx } from "../lib/store";

const FRAME_COUNT = 110;
const framePath = (i) =>
  `${import.meta.env.BASE_URL}frames/frame_${String(i).padStart(4, "0")}.jpg`;

/**
 * Site-wide scroll-scrubbed background. A fixed, full-screen canvas that plays
 * the marble-gold frame sequence as the page scrolls (0 → 1 maps to frame
 * 1 → FRAME_COUNT), cover-fit and DPR-aware. A dark scrim keeps text readable.
 */
export default function ScrollFrames() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const images = new Array(FRAME_COUNT);
    let W = 0, H = 0, current = -1, raf = 0;

    function cover(img) {
      const ir = img.width / img.height;
      const cr = W / H;
      let dw, dh;
      if (cr > ir) { dw = W; dh = W / ir; } else { dh = H; dw = H * ir; }
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }
    function draw(i) {
      const img = images[i];
      if (img && img.complete && img.naturalWidth) {
        ctx.clearRect(0, 0, W, H);
        cover(img);
        current = i;
      }
    }
    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const c = current; current = -1; draw(c < 0 ? 0 : c);
    }

    // Preload all frames; draw the first as soon as it arrives.
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = () => { if (i === 0) draw(0); };
      img.src = framePath(i + 1);
      images[i] = img;
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Lenis updates fx.scroll (0..1); rAF maps it to a frame and redraws on change.
    function loop() {
      raf = requestAnimationFrame(loop);
      const f = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(fx.scroll * (FRAME_COUNT - 1))));
      if (f !== current) draw(f);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,6,10,0.5), rgba(5,6,10,0.42) 40%, rgba(5,6,10,0.56))",
        }}
      />
    </div>
  );
}
