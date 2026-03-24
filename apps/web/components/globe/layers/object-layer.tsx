import { useEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { TrackedObjectSummary } from "@sdmps/domain";
import { objectClassColor, riskTierColor, toScenePosition } from "@sdmps/scene";

const MAX_OBJECTS = 2000;
const INSTANCE_RADIUS = 0.045;
const SELECTED_RADIUS = 0.07;

type ObjectLayerProps = {
  objects: TrackedObjectSummary[];
  selectedObjectId?: string;
  onSelectObject: (objectId?: string) => void;
};

export function ObjectLayer({ objects, selectedObjectId, onSelectObject }: ObjectLayerProps) {
  const visibleObjects = useMemo(() => objects.slice(0, MAX_OBJECTS), [objects]);

  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Shared geometry and material for the instanced mesh
  const geometry = useMemo(() => new THREE.SphereGeometry(INSTANCE_RADIUS, 8, 8), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        emissiveIntensity: 0.3
      }),
    []
  );

  // Set instance matrices and colors whenever visible objects change
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < visibleObjects.length; i++) {
      const object = visibleObjects[i];
      if (!object) continue;
      const [x, y, z] = toScenePosition(object.positionKm);
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.set(objectClassColor(object.objectClass));
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [visibleObjects]);

  // Map instanceId back to object id for click handling
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.instanceId !== undefined) {
      const clicked = visibleObjects[event.instanceId];
      if (clicked) {
        onSelectObject(clicked.id);
      }
    }
  };

  // Find selected object from the visible slice for the overlay mesh
  const selectedObject = useMemo(
    () => visibleObjects.find((o) => o.id === selectedObjectId),
    [visibleObjects, selectedObjectId]
  );

  return (
    <>
      {/* Single draw call for all objects */}
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, visibleObjects.length]}
        onClick={handleClick}
      />

      {/* Separate larger mesh rendered on top of the selected object */}
      {selectedObject ? (
        <mesh position={toScenePosition(selectedObject.positionKm)}>
          <sphereGeometry args={[SELECTED_RADIUS, 16, 16]} />
          <meshStandardMaterial
            color={objectClassColor(selectedObject.objectClass)}
            emissive={objectClassColor(selectedObject.objectClass)}
            emissiveIntensity={0.9}
          />
        </mesh>
      ) : null}
    </>
  );
}
