// Lightweight mutable store read inside the 3D render loop (no re-renders).
export const fx = {
  scroll: 0, // 0..1 of page scroll
  px: 0,     // pointer x, -1..1
  py: 0,     // pointer y, -1..1
};
