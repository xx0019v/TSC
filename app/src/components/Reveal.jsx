import { motion } from "framer-motion";

/** Scroll-triggered fade + rise. Reused by every non-headline element. */
export default function Reveal({ children, className = "", delay = 0, y = 36, once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-12% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
