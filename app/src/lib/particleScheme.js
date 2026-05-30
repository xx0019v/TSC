/**
 * Per-section particle profile — the single source of truth for the global
 * particle field's tone across the site. The GlobalParticleField reads each
 * section's profile, weights it by how much of that section overlaps the
 * viewport, and LERPs the live envelope toward the blended target.
 *
 * Profile knobs:
 *   density    Fraction of the pool to render this section  (0..1)
 *   brightness Alpha scale                                    (0..1+)
 *   size       Size multiplier on top of each particle's own  (0..1+)
 *   centerDim  How strongly to fade particles in the centre   (0..1)
 *   drift      How much scroll velocity drags particles down  (0..0.3)
 *
 * Calibrated for a quiet luxury feel: Hero leads, sub-sections recede,
 * Apply briefly returns, Footer almost silent — "余韻だけ残す".
 */
export const PROFILES = {
  hero:       { density: 1.00, brightness: 1.00, size: 1.25, centerDim: 0.60, drift: 0.18 },
  difference: { density: 0.32, brightness: 0.78, size: 1.00, centerDim: 0.30, drift: 0.10 },
  features:   { density: 0.22, brightness: 0.62, size: 0.90, centerDim: 0.28, drift: 0.08 },
  showcase:   { density: 0.26, brightness: 0.68, size: 0.95, centerDim: 0.28, drift: 0.10 },
  pricing:    { density: 0.22, brightness: 0.62, size: 0.90, centerDim: 0.28, drift: 0.08 },
  faq:        { density: 0.20, brightness: 0.58, size: 0.88, centerDim: 0.30, drift: 0.08 },
  apply:      { density: 0.55, brightness: 0.92, size: 1.10, centerDim: 0.45, drift: 0.14 },
  footer:     { density: 0.12, brightness: 0.45, size: 0.85, centerDim: 0.15, drift: 0.05 },
};

/** Used between sections (no section overlapping the viewport). */
export const DEFAULT_PROFILE = PROFILES.features;

/** Section IDs the global field tracks, in document order. */
export const SECTION_IDS = [
  "hero",
  "difference",
  "features",
  "showcase",
  "pricing",
  "faq",
  "apply",
  "footer",
];
