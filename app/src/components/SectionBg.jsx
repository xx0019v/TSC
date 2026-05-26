/**
 * Full-bleed brand-image section background. `opacity` controls how visible the
 * texture is; `scrim` controls the dark overlay (keeps text readable — WCAG).
 * Marble is a light image, so it needs a higher scrim than the dark gold.
 */
export default function SectionBg({ src, opacity = 0.42, scrim = 0.6 }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden" aria-hidden="true">
      <img
        src={`${import.meta.env.BASE_URL}${src}`}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
        style={{ opacity }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, rgba(5,6,10,${scrim + 0.12}) 0%, rgba(5,6,10,${scrim - 0.12}) 42%, rgba(5,6,10,${scrim - 0.06}) 60%, rgba(5,6,10,${scrim + 0.16}) 100%)`,
        }}
      />
    </div>
  );
}
