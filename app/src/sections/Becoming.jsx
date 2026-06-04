import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import SectionMark from "../components/SectionMark";
import { useLang } from "../lib/lang";
import { prefersReduced } from "../lib/env";

/**
 * Becoming — a pinned 400vh scrolltelling moment. Four short sentences
 * cross-fade through scroll progress while the whole environment (back-
 * ground colour, soft horizon, halo intensity, side rule, scroll dot)
 * transforms in sync. The visitor literally scrolls the brand promise —
 * from "I don't get it" to "I speak with confidence".
 *
 * No interaction required; the scroll IS the interaction. Idle visitors
 * see a calm typographic spread; engaged visitors see a slow
 * metamorphosis. Mobile shortens the pin and tightens the type so the
 * experience still fits, just compressed.
 *
 * Implementation: a tall outer section (height: 400vh / 320vh mobile) +
 * a sticky inner box at top:0 / h-screen. All animations are driven by
 * scrollYProgress through useTransform — no JS rAF chain, no expensive
 * paints. The biggest cost is one giant blurred glow div, which is GPU-
 * composited.
 */

const SCENES = {
  ja: [
    "わからない",
    "言葉が 見えてくる",
    "声を 出している",
    "話せる 自信",
  ],
  en: [
    "I don't get it",
    "Words begin to come",
    "I'm speaking up",
    "I speak with confidence",
  ],
};

const TAG = { ja: "うまれる", en: "Becoming" };
const HINT = {
  ja: "ゆっくりスクロールしてください",
  en: "Scroll slowly through it",
};

/**
 * One scene's animation derived from scrollYProgress.
 * `range = [start, peakIn, peakOut, end]`.
 * Opacity goes 0 → 1 between start..peakIn, holds, returns to 0 between
 * peakOut..end. y, scale, blur and goldness modulate around the peak so
 * each line feels like it floats in, settles, then drifts up and out.
 */
function useScene(progress, range, opts = {}) {
  const { startY = 80, endY = -80, peakScale = 1, baseScale = 0.88, goldEnd = 0 } = opts;
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, [range[0], range[3]], [startY, endY]);
  const scale = useTransform(progress, range, [baseScale, peakScale, peakScale, baseScale * 1.02]);
  const blur = useTransform(progress, range, ["blur(8px)", "blur(0px)", "blur(0px)", "blur(6px)"]);
  const gold = useTransform(progress, range, [0, goldEnd * 0.4, goldEnd, goldEnd]);
  return { opacity, y, scale, blur, gold };
}

export default function Becoming() {
  const { lang } = useLang();
  const scenes = SCENES[lang] || SCENES.en;
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // Spring-smooth the progress so cheap mouse-wheel ticks read as
  // continuous motion, not stepwise.
  const sp = useSpring(scrollYProgress, { damping: 28, stiffness: 90, mass: 0.4 });

  // Each scene occupies a ~25% slice of the section's scroll range.
  const sceneA = useScene(sp, [0.00, 0.08, 0.18, 0.28], { startY: 90,  peakScale: 1.00, baseScale: 0.90, goldEnd: 0.0 });
  const sceneB = useScene(sp, [0.22, 0.32, 0.42, 0.52], { startY: 70,  peakScale: 1.04, baseScale: 0.92, goldEnd: 0.25 });
  const sceneC = useScene(sp, [0.46, 0.56, 0.66, 0.76], { startY: 60,  peakScale: 1.08, baseScale: 0.94, goldEnd: 0.55 });
  const sceneD = useScene(sp, [0.70, 0.80, 1.00, 1.05], { startY: 55,  peakScale: 1.14, baseScale: 0.96, goldEnd: 1.0  });

  // Pre-compute the colour MotionValues at the top level — useTransform
  // is a hook and cannot live inside a map() callback.
  const colorA = useTransform(sceneA.gold, [0, 1], ["rgba(245,242,234,1)", "rgba(252,233,184,1)"]);
  const colorB = useTransform(sceneB.gold, [0, 1], ["rgba(245,242,234,1)", "rgba(252,233,184,1)"]);
  const colorC = useTransform(sceneC.gold, [0, 1], ["rgba(245,242,234,1)", "rgba(252,233,184,1)"]);
  const colorD = useTransform(sceneD.gold, [0, 1], ["rgba(245,242,234,1)", "rgba(252,233,184,1)"]);

  // Environment — these are independent of each scene's local interpolation.
  const horizonY = useTransform(sp, [0, 1], ["62%", "44%"]);
  const horizonOpacity = useTransform(sp, [0, 0.3, 1], [0, 0.25, 0.6]);
  const haloOpacity = useTransform(sp, [0, 0.4, 1], [0.08, 0.30, 0.75]);
  const haloScale = useTransform(sp, [0, 1], [0.6, 1.4]);
  const bgVeil = useTransform(
    sp,
    [0, 0.45, 1],
    ["rgba(5,6,10,0.85)", "rgba(11,16,32,0.55)", "rgba(34,24,10,0.30)"]
  );

  // The thin vertical rule on the right that fills as the scene
  // progresses — a quiet "you are in the middle of becoming" cue.
  const ruleFillHeight = useTransform(sp, [0, 1], ["0%", "100%"]);

  const reduce = prefersReduced;

  return (
    <section
      id="becoming"
      ref={sectionRef}
      // 400vh on desktop, 320vh on mobile — the pin lasts long enough
      // for each scene to read but not so long it tires.
      className="relative"
      style={{ height: reduce ? "auto" : "400vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Environment veil — colour temperature shifts with progress. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: reduce ? "rgba(11,16,32,0.4)" : bgVeil }}
        />

        {/* Halo behind the scene text — small + dim early, large + golden late. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[60vh] w-[60vh] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(252,233,184,0.55), rgba(216,184,106,0.18) 45%, transparent 70%)",
            opacity: reduce ? 0.35 : haloOpacity,
            scale: reduce ? 1 : haloScale,
          }}
        />

        {/* Soft horizon line that rises through the section. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-px"
          style={{
            top: reduce ? "50%" : horizonY,
            background:
              "linear-gradient(90deg, transparent, rgba(216,184,106,0.6) 50%, transparent)",
            opacity: reduce ? 0.5 : horizonOpacity,
          }}
        />

        {/* Editorial chrome — corner marks, never compete with the text. */}
        <div className="pointer-events-none absolute left-6 top-12 z-[2] md:left-12 md:top-16">
          <SectionMark number="04" label={TAG[lang] || TAG.en} align="left" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-12 z-[2] hidden md:right-12 md:top-16 md:block"
        >
          <span className="font-sans text-[0.6rem] uppercase tracking-[0.42em] text-ivory/40">
            Metamorphosis
          </span>
        </div>

        {/* Right-side scroll rule. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-6 top-1/2 z-[2] hidden h-32 w-px -translate-y-1/2 overflow-hidden bg-white/10 md:right-14 md:block"
        >
          <motion.div
            className="block w-full bg-gradient-to-b from-gold-bright to-gold"
            style={{ height: reduce ? "100%" : ruleFillHeight }}
          />
        </div>

        {/* Stage — the four scenes stack at the same position; only one
            is at-opacity at a time. */}
        <div className="relative flex h-full items-center justify-center px-6">
          {/* Static stack — accessibility-friendly. Each scene's text is
              real HTML so screen readers read all four in order. */}
          <div className="relative w-full max-w-4xl text-center">
            {[
              { text: scenes[0], anim: sceneA, color: colorA, idx: 0 },
              { text: scenes[1], anim: sceneB, color: colorB, idx: 1 },
              { text: scenes[2], anim: sceneC, color: colorC, idx: 2 },
              { text: scenes[3], anim: sceneD, color: colorD, idx: 3 },
            ].map(({ text, anim, color, idx }) => (
              <motion.p
                key={idx}
                className="display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-pre-line text-[clamp(2.2rem,1.2rem+4vw,5.5rem)] leading-[1.05] tracking-[-0.01em]"
                style={
                  reduce
                    ? { opacity: idx === 3 ? 1 : 0.35 }
                    : {
                        opacity: anim.opacity,
                        y: anim.y,
                        scale: anim.scale,
                        filter: anim.blur,
                        color,
                        textShadow:
                          "0 4px 36px rgba(5,6,10,0.7), 0 0 24px rgba(216,184,106,0.18)",
                      }
                }
              >
                {text}
              </motion.p>
            ))}
          </div>
        </div>

        {/* Bottom hint */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.42em] text-ivory/35">
            {HINT[lang] || HINT.en}
          </p>
        </div>
      </div>
    </section>
  );
}
