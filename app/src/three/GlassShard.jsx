import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { fx } from "../lib/store";
import { isMobile } from "../lib/env";

/**
 * The hero artifact — a faceted crystal that refracts the gold light,
 * auto-rotates, drifts toward the pointer, and reframes as you scroll.
 * Mobile falls back to a lit metallic material (transmission is expensive).
 */
export default function GlassShard() {
  const group = useRef();
  const mesh = useRef();

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    if (!group.current || !mesh.current) return;

    // continuous slow spin
    mesh.current.rotation.y += dt * 0.18;
    mesh.current.rotation.z += dt * 0.04;

    // scroll spins + gently drifts the artifact (camera handles the dolly)
    const s = fx.scroll;
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, s * Math.PI * 1.6, 0.06);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -s * 0.6, 0.06);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, Math.sin(s * Math.PI) * 0.6, 0.06);

    // pointer parallax
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, fx.px * 0.4, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -fx.py * 0.25, 0.05);
  });

  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.9}>
      <group ref={group}>
        {/* soft additive halos — "bloom" without postprocessing */}
        <mesh scale={3.2}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color="#a9821f" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh scale={2.1}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#d8b86a" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh scale={1.25}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#fce9b8" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        {/* luminous core — refracted by the crystal */}
        <mesh scale={0.62}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#fff6e0" toneMapped={false} />
        </mesh>

        <mesh ref={mesh} scale={isMobile ? 1.3 : 1.6}>
          <icosahedronGeometry args={[1.2, 0]} />
          {isMobile ? (
            <meshStandardMaterial
              color="#d8b86a"
              metalness={1}
              roughness={0.12}
              emissive="#7a5e1f"
              emissiveIntensity={0.35}
            />
          ) : (
            <MeshTransmissionMaterial
              backside
              samples={6}
              resolution={256}
              transmission={1}
              thickness={1.4}
              roughness={0.06}
              chromaticAberration={0.45}
              anisotropy={0.3}
              distortion={0.3}
              distortionScale={0.3}
              temporalDistortion={0.08}
              ior={1.45}
              attenuationColor="#fce9b8"
              attenuationDistance={2.5}
              color="#ffffff"
            />
          )}
        </mesh>
      </group>
    </Float>
  );
}
