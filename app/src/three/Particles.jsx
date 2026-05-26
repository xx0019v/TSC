import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { inSphere } from "maath/random";
import * as THREE from "three";
import { fx } from "../lib/store";
import { isMobile } from "../lib/env";

/** A slowly drifting gold nebula that reacts subtly to scroll + pointer. */
export default function Particles() {
  const ref = useRef();
  const count = isMobile ? 900 : 2600;

  const positions = useMemo(() => {
    return inSphere(new Float32Array(count * 3), { radius: 7 });
  }, [count]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.025;
    ref.current.rotation.x -= dt * 0.012;
    // gentle pointer + scroll parallax
    ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, fx.px * 0.4, 0.04);
    ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, -fx.py * 0.4 + fx.scroll * 1.2, 0.04);
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#f0d68a"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        opacity={0.9}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}
