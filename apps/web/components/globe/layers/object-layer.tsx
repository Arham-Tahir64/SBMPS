import type { TrackedObjectSummary } from "@sdmps/domain";
import { riskTierColor, toScenePosition } from "@sdmps/scene";

export function ObjectLayer({ objects }: { objects: TrackedObjectSummary[] }) {
  return (
    <>
      {objects.map((object) => (
        <mesh key={object.id} position={toScenePosition(object.positionKm)}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshStandardMaterial color={riskTierColor(object.riskTier)} emissive={riskTierColor(object.riskTier)} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </>
  );
}
