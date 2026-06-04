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
  // tint = [r, g, b, a] overlay applied site-wide via <SectionTint />.
  // All luxury-dark; only the hue subtly shifts so the scroll feels like a
  // change in lighting, not a change in palette.
  hero:       { density: 1.00, brightness: 1.00, size: 1.25, centerDim: 0.60, drift: 0.18, tint: [5, 6, 10, 0.00] },
  difference: { density: 0.32, brightness: 0.78, size: 1.00, centerDim: 0.30, drift: 0.10, tint: [9, 14, 28, 0.22] },
  features:   { density: 0.22, brightness: 0.62, size: 0.90, centerDim: 0.28, drift: 0.08, tint: [14, 10, 24, 0.26] },
  showcase:   { density: 0.26, brightness: 0.68, size: 0.95, centerDim: 0.28, drift: 0.10, tint: [28, 18, 12, 0.24] },
  path:       { density: 0.30, brightness: 0.75, size: 1.00, centerDim: 0.38, drift: 0.10, tint: [12, 14, 24, 0.24] },
  // Becoming runs its own halo + horizon; keep global field quiet here
  // and shift the tint slightly warmer as the section progresses (this
  // is the average — Becoming itself paints the late-section gold).
  becoming:   { density: 0.18, brightness: 0.55, size: 0.92, centerDim: 0.48, drift: 0.06, tint: [16, 12, 10, 0.32] },
  capsule:    { density: 0.36, brightness: 0.80, size: 1.05, centerDim: 0.42, drift: 0.12, tint: [4,  4,  8, 0.32] },
  pricing:    { density: 0.22, brightness: 0.62, size: 0.90, centerDim: 0.28, drift: 0.08, tint: [12, 16, 14, 0.22] },
  faq:        { density: 0.20, brightness: 0.58, size: 0.88, centerDim: 0.30, drift: 0.08, tint: [16, 12, 22, 0.22] },
  apply:      { density: 0.55, brightness: 0.92, size: 1.10, centerDim: 0.45, drift: 0.14, tint: [34, 24, 10, 0.26] },
  footer:     { density: 0.12, brightness: 0.45, size: 0.85, centerDim: 0.15, drift: 0.05, tint: [0,  0,  0,  0.42] },
};

/** Used between sections (no section overlapping the viewport). */
export const DEFAULT_PROFILE = PROFILES.features;

/** Section IDs the global field tracks, in document order. */
export const SECTION_IDS = [
  "hero",
  "difference",
  "features",
  "showcase",
  "becoming",
  "capsule",
  "pricing",
  "faq",
  "path",
  "apply",
  "footer",
];
