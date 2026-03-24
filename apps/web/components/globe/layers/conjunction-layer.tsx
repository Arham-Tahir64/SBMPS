import type { ConjunctionEventSummary, TrackedObjectSummary } from "@sdmps/domain";
import { riskTierColor, toScenePosition } from "@sdmps/scene";

type ConjunctionLayerProps = {
  conjunctions: ConjunctionEventSummary[];
  objects: TrackedObjectSummary[];
  selectedConjunctionId?: string;
  onSelectConjunction: (conjunctionId?: string) => void;
};

export function ConjunctionLayer({
  conjunctions,
  objects,
  selectedConjunctionId,
  onSelectConjunction
}: ConjunctionLayerProps) {
  return (
    <>
      {conjunctions.map((conjunction) => {
        const object = objects.find((item) => item.id === conjunction.primaryObjectId);
        if (!object) {
          return null;
        }

        return (
          <mesh
            key={conjunction.id}
            position={toScenePosition(object.positionKm)}
            onClick={() => onSelectConjunction(conjunction.id)}
          >
            <sphereGeometry args={[conjunction.id === selectedConjunctionId ? 0.14 : 0.09, 16, 16]} />
            <meshStandardMaterial color={riskTierColor(conjunction.riskTier)} wireframe />
          </mesh>
        );
      })}
    </>
  );
}
