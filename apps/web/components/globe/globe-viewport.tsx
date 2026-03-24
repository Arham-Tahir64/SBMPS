"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { ConjunctionEventSummary, TrackedObjectSummary } from "@sdmps/domain";
import type { LayerVisibility } from "../../store/operations-store";
import { riskTierColor, toScenePosition } from "@sdmps/scene";
import { ConjunctionLayer } from "./layers/conjunction-layer";
import { HeatmapLayer } from "./layers/heatmap-layer";
import { ObjectLayer } from "./layers/object-layer";
import { OrbitLayer } from "./layers/orbit-layer";

// ---------------------------------------------------------------------------
// Continent lat/lon boundary loops (degrees).
// Each entry is [lat, lon].
// ---------------------------------------------------------------------------

const AFRICA: [number, number][] = [
  [37, 10], [33, -6], [22, -18], [12, -18], [5, -8], [-5, 10], [-17, 12],
  [-34, 26], [-30, 32], [-18, 37], [-10, 40], [0, 42], [10, 42], [15, 42],
  [20, 38], [28, 34], [30, 32], [34, 28], [37, 22], [37, 10]
];

const EURASIA: [number, number][] = [
  [70, 30], [60, 25], [50, 5], [36, 5], [36, 28], [42, 40], [40, 50],
  [30, 50], [20, 58], [22, 68], [28, 77], [40, 68], [50, 82], [55, 85],
  [60, 100], [55, 130], [50, 140], [42, 132], [35, 128], [25, 122],
  [20, 110], [10, 104], [22, 92], [30, 78], [38, 68], [40, 55],
  [38, 44], [45, 40], [60, 40], [62, 30], [70, 30]
];

const NORTH_AMERICA: [number, number][] = [
  [70, -140], [60, -140], [55, -130], [48, -124], [38, -122], [30, -118],
  [20, -105], [16, -92], [20, -88], [24, -82], [28, -82], [36, -76],
  [42, -70], [48, -66], [50, -60], [58, -68], [62, -76], [68, -82],
  [72, -90], [72, -110], [70, -140]
];

const SOUTH_AMERICA: [number, number][] = [
  [12, -72], [8, -62], [2, -50], [-10, -38], [-20, -42], [-34, -58],
  [-42, -64], [-52, -70], [-56, -68], [-38, -58], [-20, -44], [0, -50],
  [10, -62], [12, -72]
];

const AUSTRALIA: [number, number][] = [
  [-16, 136], [-18, 122], [-22, 114], [-30, 114], [-35, 118], [-38, 146],
  [-38, 150], [-34, 152], [-26, 154], [-16, 146], [-12, 136], [-16, 136]
];

const CONTINENT_LOOPS: [number, number][][] = [
  AFRICA,
  EURASIA,
  NORTH_AMERICA,
  SOUTH_AMERICA,
  AUSTRALIA
];

const GLOBE_RADIUS = 2;

/**
 * Convert a lat/lon pair (degrees) to a THREE.Vector3 on a sphere of the
 * given radius. East increases to the right in the scene (negate sin(lon)).
 */
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  return new THREE.Vector3(
    radius * Math.cos(latRad) * Math.cos(lonRad),
    radius * Math.sin(latRad),
    radius * Math.cos(latRad) * -Math.sin(lonRad)
  );
}

// ---------------------------------------------------------------------------
// ContinentLines — draws each continent boundary as a THREE.LineLoop
// ---------------------------------------------------------------------------

function ContinentLines() {
  const lineObjects = useMemo(() => {
    return CONTINENT_LOOPS.map((loop, idx) => {
      const points = loop.map(([lat, lon]) => latLonToVec3(lat, lon, GLOBE_RADIUS));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      return { key: idx, geometry };
    });
  }, []);

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(0xffffff),
        transparent: true,
        opacity: 0.18
      }),
    []
  );

  return (
    <>
      {lineObjects.map(({ key, geometry }) => (
        <lineLoop key={key} args={[geometry, lineMaterial]} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// EarthSphere — ocean base + atmosphere halo + continent lines
// ---------------------------------------------------------------------------

function EarthSphere() {
  return (
    <group>
      {/* Ocean base */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#0d3060"
          emissive="#061428"
          emissiveIntensity={0.4}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere halo — slightly larger transparent sphere */}
      <mesh scale={1.02}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Continent outlines */}
      <ContinentLines />
    </group>
  );
}

// ---------------------------------------------------------------------------
// GlobeViewport
// ---------------------------------------------------------------------------

type GlobeViewportProps = {
  objects: TrackedObjectSummary[];
  conjunctions: ConjunctionEventSummary[];
  selectedObjectId?: string;
  selectedConjunctionId?: string;
  layerVisibility: LayerVisibility;
  onSelectObject: (objectId?: string) => void;
  onSelectConjunction: (conjunctionId?: string) => void;
};

export function GlobeViewport({
  objects,
  conjunctions,
  selectedObjectId,
  selectedConjunctionId,
  layerVisibility,
  onSelectObject,
  onSelectConjunction
}: GlobeViewportProps) {
  const selectedObject = objects.find((item) => item.id === selectedObjectId);

  return (
    <div style={{ height: 560, borderRadius: 20, overflow: "hidden" }}>
      <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
        <ambientLight intensity={1.2} />
        <pointLight position={[8, 8, 8]} intensity={120} />

        <EarthSphere />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />

        {layerVisibility.objects ? (
          <ObjectLayer objects={objects} selectedObjectId={selectedObjectId} onSelectObject={onSelectObject} />
        ) : null}
        {layerVisibility.conjunctions ? (
          <ConjunctionLayer
            conjunctions={conjunctions}
            objects={objects}
            selectedConjunctionId={selectedConjunctionId}
            onSelectConjunction={onSelectConjunction}
          />
        ) : null}
        {layerVisibility.heatmap ? <HeatmapLayer /> : null}
        {layerVisibility.orbit && selectedObject ? (
          <OrbitLayer
            points={[toScenePosition(selectedObject.positionKm)]}
            color={riskTierColor(selectedObject.riskTier)}
          />
        ) : null}
      </Canvas>
    </div>
  );
}
