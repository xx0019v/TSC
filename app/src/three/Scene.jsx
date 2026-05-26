import { Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import Lighting from "./Lighting";
import GlassShard from "./GlassShard";
import Particles from "./Particles";
import { fx } from "../lib/store";
import { isMobile } from "../lib/env";

/** Cinematic camera: dollies back + drifts down as you scroll; subtle pointer orbit. */
function CameraRig() {
  const { camera } = useThree();
  useFrame(() => {
    const s = fx.scroll;
    const tx = fx.px * 0.6;
    const ty = -fx.py * 0.35 - s * 0.6;
    const tz = 5 + s * 3.2;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.045);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.045);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, tz, 0.045);
    camera.lookAt(0, -s * 0.8, 0);
  });
  return null;
}

export default function Scene() {
  const [dpr, setDpr] = useState(isMobile ? 1.3 : 1.8);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 38 }}
      dpr={[1, dpr]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.4))} />
      <AdaptiveDpr pixelated />
      <CameraRig />

      <Suspense fallback={null}>
        <Lighting />
        <GlassShard />
      </Suspense>
      <Particles />
    </Canvas>
  );
}
