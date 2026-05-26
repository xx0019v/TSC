import { motion } from "framer-motion";

/**
 * Headline reveal: each line sits in an overflow-hidden mask and rises into view.
 * Pass `lines` (array of strings). `play` gates the animation (e.g. after loader).
 */
export default function SplitReveal({
  lines = [],
  play = true,
  className = "",
  delay = 0,
  as = "h1",
  gold, // index of the line to render in gold, or array of indices
}) {
  const Tag = motion[as] || motion.h1;
  const goldSet = Array.isArray(gold) ? gold : gold != null ? [gold] : [];

  return (
    <Tag className={className} aria-label={lines.join(" ")}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <motion.span
            className="block"
            initial={{ y: "110%" }}
            animate={play ? { y: "0%" } : { y: "110%" }}
            transition={{
              duration: 1.1,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + i * 0.12,
            }}
            style={goldSet.includes(i) ? { color: "var(--gold)" } : undefined}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
