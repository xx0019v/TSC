/**
 * Full-bleed brand-image section background with a heavy scrim so text stays
 * readable (WCAG contrast). `src` is a file in /public (e.g. "marble.jpg").
 */
export default function SectionBg({ src, opacity = 0.22, tint = "rgba(5,6,10,0.8)" }) {
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
          background: `linear-gradient(180deg, ${tint}, rgba(5,6,10,0.66) 45%, ${tint})`,
        }}
      />
    </div>
  );
}
