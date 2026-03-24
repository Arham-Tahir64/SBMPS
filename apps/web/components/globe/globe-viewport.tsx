"use client";

import { Canvas } from "@react-three/fiber";
import type { ConjunctionEventSummary, TrackedObjectSummary } from "@sdmps/domain";
import { DEFAULT_CAMERA_POSITION, riskTierColor, toScenePosition } from "@sdmps/scene";
import { ConjunctionLayer } from "./layers/conjunction-layer";
import { HeatmapLayer } from "./layers/heatmap-layer";
import { ObjectLayer } from "./layers/object-layer";
import { OrbitLayer } from "./layers/orbit-layer";

type GlobeViewportProps = {
  objects: TrackedObjectSummary[];
  conjunctions: ConjunctionEventSummary[];
  selectedObjectId?: string;
};

export function GlobeViewport({ objects, conjunctions, selectedObjectId }: GlobeViewportProps) {
  const selectedObject = objects.find((item) => item.id === selectedObjectId);

  return (
    <div style={{ height: 560, borderRadius: 20, overflow: "hidden" }}>
      <Canvas camera={{ position: DEFAULT_CAMERA_POSITION, fov: 45 }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[8, 8, 8]} intensity={120} />
        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial color="#0d2c53" emissive="#09213f" emissiveIntensity={0.4} wireframe />
        </mesh>
        <ObjectLayer objects={objects} />
        <ConjunctionLayer conjunctions={conjunctions} objects={objects} />
        <HeatmapLayer />
        {selectedObject ? <OrbitLayer points={[toScenePosition(selectedObject.positionKm)]} color={riskTierColor(selectedObject.riskTier)} /> : null}
      </Canvas>
    </div>
  );
}
