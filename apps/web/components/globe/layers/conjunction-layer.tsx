import type { ConjunctionEventSummary, TrackedObjectSummary } from "@sdmps/domain";
import { riskTierColor, toScenePosition } from "@sdmps/scene";

type ConjunctionLayerProps = {
  conjunctions: ConjunctionEventSummary[];
  objects: TrackedObjectSummary[];
};

export function ConjunctionLayer({ conjunctions, objects }: ConjunctionLayerProps) {
  return (
    <>
      {conjunctions.map((conjunction) => {
        const object = objects.find((item) => item.id === conjunction.primaryObjectId);
        if (!object) {
          return null;
        }

        return (
          <mesh key={conjunction.id} position={toScenePosition(object.positionKm)}>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color={riskTierColor(conjunction.riskTier)} wireframe />
          </mesh>
        );
      })}
    </>
  );
}
