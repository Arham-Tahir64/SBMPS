import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { TrackedObjectSummary } from "@sdmps/domain";
import { objectClassColor, toScenePosition } from "@sdmps/scene";

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

  /**
   * Create the InstancedMesh once. Critically, we call setColorAt(0, white)
   * immediately so instanceColor is non-null before the mesh is ever added
   * to the scene. This ensures Three.js compiles the shader with
   * USE_INSTANCING_COLOR defined — preventing the "all instances black" bug
   * that occurs when instanceColor is null at first shader compilation.
   */
  const mesh = useMemo(() => {
    const geometry = new THREE.SphereGeometry(INSTANCE_RADIUS, 8, 8);
    const material = new THREE.MeshStandardMaterial({ emissiveIntensity: 0.25 });
    const m = new THREE.InstancedMesh(geometry, material, MAX_OBJECTS);
    m.count = 0;
    // Seed instanceColor so USE_INSTANCING_COLOR is active from first render.
    m.setColorAt(0, new THREE.Color(1, 1, 1));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    return m;
  }, []);

  // Update matrices and colors whenever visible objects change.
  useEffect(() => {
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    mesh.count = visibleObjects.length;

    for (let i = 0; i < visibleObjects.length; i++) {
      const obj = visibleObjects[i];
      if (!obj) continue;
      const [x, y, z] = toScenePosition(obj.positionKm);
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(objectClassColor(obj.objectClass));
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [mesh, visibleObjects]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) {
      const clicked = visibleObjects[e.instanceId];
      if (clicked) onSelectObject(clicked.id);
    }
  };

  const selectedObject = useMemo(
    () => visibleObjects.find((o) => o.id === selectedObjectId),
    [visibleObjects, selectedObjectId]
  );

  return (
    <>
      <primitive object={mesh} onClick={handleClick} />

      {selectedObject ? (
        <mesh position={toScenePosition(selectedObject.positionKm)}>
          <sphereGeometry args={[SELECTED_RADIUS, 14, 14]} />
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
