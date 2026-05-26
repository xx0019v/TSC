import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

/** Desktop-only cinematic post: bloom + subtle aberration, vignette, film grain. */
export default function Effects() {
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <Bloom intensity={1.15} luminanceThreshold={0.08} luminanceSmoothing={0.4} mipmapBlur radius={0.85} />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0006, 0.0006]} />
      <Vignette offset={0.28} darkness={0.92} eskil={false} />
      <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.03} />
    </EffectComposer>
  );
}
