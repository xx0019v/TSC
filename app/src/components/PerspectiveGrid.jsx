/**
 * PerspectiveGrid — a very faint vanishing-point grid drawn in SVG that
 * sits behind the rest of the scene at zIndex: -8 (above ScrollFrames
 * marble, below SectionTint and the particle field).
 *
 * Visually: gold horizon lines emanating from a centred vanishing point,
 * with horizontal bands that thin out toward the viewer — the cinematic
 * "deep space" frame of luxury futurism, dialled down so it never
 * competes with the typography or particles.
 *
 * Pure SVG (no canvas, no RAF) — costs nothing on the main thread.
 */

const COLOR = "rgba(216,184,106,0.06)";
const COLOR_STRONG = "rgba(216,184,106,0.10)";

export default function PerspectiveGrid() {
  // Vanishing point at 50%, 55% (slightly below true centre so the
  // composition leaves room for the headline above the horizon).
  const vx = 50;
  const vy = 55;

  // Horizon lines below the vanishing point — perspective-shortened.
  const horizons = [];
  for (let i = 1; i <= 14; i++) {
    // Position lines using a power curve so they bunch toward the horizon.
    const t = Math.pow(i / 14, 1.7);
    const y = vy + t * 45;
    horizons.push(y);
  }

  // Radial lines from the vanishing point outward.
  const radials = [];
  const N_RADIALS = 22;
  for (let i = 0; i < N_RADIALS; i++) {
    const angle = (i / (N_RADIALS - 1)) * Math.PI; // half-circle below horizon
    const dx = Math.cos(angle) * 80;
    const dy = Math.sin(angle) * 80;
    radials.push({ x: vx + dx, y: vy + dy });
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -8 }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <defs>
          {/* Lines fade toward the edges so the grid feels like an open
              space rather than a hard floor. */}
          <radialGradient id="pg-fade" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor={COLOR_STRONG} stopOpacity="1" />
            <stop offset="60%" stopColor={COLOR} stopOpacity="0.7" />
            <stop offset="100%" stopColor={COLOR} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Radial perspective lines */}
        <g stroke="url(#pg-fade)" strokeWidth="0.06" fill="none">
          {radials.map((p, i) => (
            <line key={`r${i}`} x1={vx} y1={vy} x2={p.x} y2={p.y} />
          ))}
        </g>

        {/* Horizon bands */}
        <g stroke="url(#pg-fade)" strokeWidth="0.06" fill="none">
          {horizons.map((y, i) => (
            <line key={`h${i}`} x1="0" y1={y} x2="100" y2={y} />
          ))}
        </g>

        {/* Soft horizon glow */}
        <ellipse
          cx={vx}
          cy={vy}
          rx="22"
          ry="2.5"
          fill="rgba(252,233,184,0.05)"
        />
      </svg>
    </div>
  );
}
