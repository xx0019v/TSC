import { Environment, Lightformer } from "@react-three/drei";

/**
 * Champagne-on-navy lighting. The Environment is built from in-scene
 * Lightformers (no external HDR fetch) so the glass has something rich to refract.
 */
export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 6, 4]} intensity={2.2} color="#fce9b8" />
      <directionalLight position={[-6, -3, -4]} intensity={1.1} color="#7fb0ff" />
      <pointLight position={[0, 0, 3]} intensity={6} distance={10} color="#d8b86a" />

      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#070810"]} />
        <Lightformer form="rect" intensity={7} color="#fce9b8" position={[3, 3, 2]} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={4} color="#7fb0ff" position={[-4, -1, -3]} scale={[5, 5, 1]} />
        <Lightformer form="ring" intensity={5} color="#d8b86a" position={[0, 2, -4]} scale={[3, 3, 1]} />
        <Lightformer form="circle" intensity={6} color="#ffffff" position={[2, -3, 3]} scale={[2, 2, 1]} />
      </Environment>
    </>
  );
}
