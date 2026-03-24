import type { TrackedObjectSummary } from "@sdmps/domain";
import { riskTierColor, toScenePosition } from "@sdmps/scene";

type ObjectLayerProps = {
  objects: TrackedObjectSummary[];
  selectedObjectId?: string;
  onSelectObject: (objectId?: string) => void;
};

export function ObjectLayer({ objects, selectedObjectId, onSelectObject }: ObjectLayerProps) {
  return (
    <>
      {objects.map((object) => (
        <mesh key={object.id} position={toScenePosition(object.positionKm)} onClick={() => onSelectObject(object.id)}>
          <sphereGeometry args={[object.id === selectedObjectId ? 0.07 : 0.045, 16, 16]} />
          <meshStandardMaterial color={riskTierColor(object.riskTier)} emissive={riskTierColor(object.riskTier)} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </>
  );
}
