// Device capability flags (evaluated once; this app is client-only).
const mq = (q) => typeof window !== "undefined" && window.matchMedia(q).matches;

export const isTouch = mq("(pointer: coarse)") || (typeof window !== "undefined" && "ontouchstart" in window);
export const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
export const prefersReduced = mq("(prefers-reduced-motion: reduce)");
