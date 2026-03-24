"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { ConjunctionEventSummary, TrackedObjectSummary } from "@sdmps/domain";
import type { LayerVisibility } from "../../store/operations-store";
import { objectClassColor, riskTierColor, toScenePosition } from "@sdmps/scene";
import { useAltitudeHeatmap } from "../../lib/queries/use-altitude-heatmap";
import { useObjectTrajectory } from "../../lib/queries/use-object-trajectory";
import { ConjunctionLayer } from "./layers/conjunction-layer";
import { HeatmapLayer } from "./layers/heatmap-layer";
import { ObjectLayer } from "./layers/object-layer";
import { OrbitLayer } from "./layers/orbit-layer";

// ---------------------------------------------------------------------------
// Continent lat/lon outlines — used to paint the canvas texture.
// Each array is a closed polygon: [lat°, lon°] pairs.
// ---------------------------------------------------------------------------

const CONTINENTS: [number, number][][] = [
  // Africa
  [
    [37,10],[34,2],[30,-6],[22,-18],[12,-18],[5,-8],[0,-8],
    [-5,10],[-10,14],[-17,12],[-28,16],[-34,26],[-34,28],
    [-28,33],[-18,37],[-10,40],[0,42],[10,42],[15,42],
    [20,38],[28,34],[30,32],[34,28],[37,22],[37,10],
  ],
  // Europe + Asia (Eurasia)
  [
    [70,30],[65,25],[58,22],[50,5],[44,5],[36,5],[36,28],
    [38,35],[42,40],[40,50],[30,50],[20,58],[22,68],
    [28,77],[38,72],[50,82],[55,85],[60,100],[55,130],
    [50,140],[42,132],[38,128],[28,122],[20,110],[10,104],
    [4,100],[2,104],[1,110],[5,118],[20,120],[22,92],
    [30,78],[38,68],[40,55],[38,44],[42,42],[45,40],
    [60,40],[62,30],[70,30],
  ],
  // North America
  [
    [70,-140],[62,-140],[55,-130],[50,-128],[48,-124],
    [38,-122],[30,-118],[26,-110],[20,-105],[16,-92],
    [20,-88],[24,-82],[30,-82],[36,-76],[42,-70],
    [48,-66],[52,-60],[58,-68],[62,-76],[68,-82],
    [72,-90],[72,-110],[70,-140],
  ],
  // South America
  [
    [12,-72],[10,-64],[8,-62],[2,-52],[-4,-44],[-10,-38],
    [-20,-42],[-28,-50],[-34,-58],[-42,-64],[-52,-70],
    [-56,-68],[-42,-62],[-32,-52],[-20,-44],[-8,-36],
    [0,-50],[8,-62],[12,-72],
  ],
  // Australia
  [
    [-16,136],[-18,122],[-22,114],[-30,114],[-34,118],
    [-36,136],[-38,146],[-38,150],[-34,152],[-28,154],
    [-22,150],[-16,146],[-12,136],[-16,136],
  ],
  // Greenland
  [
    [83,-45],[78,-68],[72,-56],[64,-50],[60,-44],
    [62,-42],[68,-32],[76,-22],[82,-20],[84,-28],[83,-45],
  ],
  // Antarctica (simplified cap below -66°)
  [
    [-66,0],[-66,30],[-66,60],[-66,90],[-66,120],[-66,150],
    [-66,180],[-66,-150],[-66,-120],[-66,-90],[-66,-60],[-66,-30],[-66,0],
  ],
];

// ---------------------------------------------------------------------------
// createEarthTexture — paints continents + ocean + grid onto a canvas,
// returns a THREE.CanvasTexture. Called once inside useMemo.
// ---------------------------------------------------------------------------

function createEarthTexture(): THREE.CanvasTexture {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // ── Ocean base ────────────────────────────────────────────────────────────
  ctx.fillStyle = "#06213d";
  ctx.fillRect(0, 0, W, H);

  // ── Latitude / longitude grid ─────────────────────────────────────────────
  ctx.strokeStyle = "rgba(30, 80, 150, 0.35)";
  ctx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * W;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let lat = -90; lat <= 90; lat += 30) {
    const y = ((90 - lat) / 180) * H;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // ── Equator — highlighted ─────────────────────────────────────────────────
  ctx.strokeStyle = "rgba(60, 130, 220, 0.55)";
  ctx.lineWidth = 1.5;
  const equatorY = H / 2;
  ctx.beginPath();
  ctx.moveTo(0, equatorY);
  ctx.lineTo(W, equatorY);
  ctx.stroke();

  // ── Continent fills ───────────────────────────────────────────────────────
  function toXY(lat: number, lon: number): [number, number] {
    return [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
  }

  ctx.fillStyle = "#1c4a30";       // land fill — dark forest green
  ctx.strokeStyle = "#2a6640";     // coastline highlight
  ctx.lineWidth = 1.5;

  for (const continent of CONTINENTS) {
    ctx.beginPath();
    const [x0, y0] = toXY(continent[0][0], continent[0][1]);
    ctx.moveTo(x0, y0);
    for (let i = 1; i < continent.length; i++) {
      const [x, y] = toXY(continent[i][0], continent[i][1]);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------------------
// EarthSphere — uses the canvas texture for land/ocean detail
// ---------------------------------------------------------------------------

const GLOBE_RADIUS = 2;

function EarthSphere() {
  const earthTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createEarthTexture();
  }, []);

  return (
    <group>
      {/* Textured globe — ocean + continents painted on canvas */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture ?? undefined}
          color={earthTexture ? "#ffffff" : "#0d3060"}
          emissive="#030f1f"
          emissiveIntensity={0.3}
          roughness={0.88}
          metalness={0.05}
        />
      </mesh>

      {/* Atmosphere halo */}
      <mesh scale={1.025}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshBasicMaterial
          color="#4a9eff"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// GlobeLegend — HTML overlay, pointer-events: none so it doesn't block canvas
// ---------------------------------------------------------------------------

const LEGEND_ENTRIES = [
  { label: "Active Satellite", color: objectClassColor("active-satellite") },
  { label: "Rocket Body",      color: objectClassColor("rocket-body") },
  { label: "Debris Fragment",  color: objectClassColor("debris-fragment") },
] as const;

const CONJUNCTION_ENTRIES = [
  { label: "Critical",  color: riskTierColor("critical") },
  { label: "High Risk", color: riskTierColor("high") },
] as const;

function GlobeLegend() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 14,
        right: 14,
        background: "rgba(4, 13, 26, 0.82)",
        border: "1px solid rgba(121, 178, 255, 0.14)",
        borderRadius: 10,
        padding: "10px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        backdropFilter: "blur(6px)",
        pointerEvents: "none",
        zIndex: 10,
        minWidth: 150,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(121,178,255,0.5)", marginBottom: 2 }}>
        Object Class
      </div>
      {LEGEND_ENTRIES.map(({ label, color }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, flexShrink: 0, boxShadow: `0 0 5px ${color}` }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{label}</span>
        </div>
      ))}
      <div style={{ height: 1, background: "rgba(121,178,255,0.12)", margin: "2px 0" }} />
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(121,178,255,0.5)", marginBottom: 2 }}>
        Conjunction Risk
      </div>
      {CONJUNCTION_ENTRIES.map(({ label, color }) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: "transparent", border: `2px solid ${color}`, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{label}</span>
        </div>
      ))}
    </div>
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
  onSelectConjunction,
}: GlobeViewportProps) {
  const selectedObject = objects.find((item) => item.id === selectedObjectId);
  const { data: heatmapBins } = useAltitudeHeatmap();
  const { data: trajectory } = useObjectTrajectory(
    layerVisibility.orbit ? selectedObjectId : undefined
  );

  return (
    <div style={{ height: 560, borderRadius: 20, overflow: "hidden", position: "relative" }}>
      <Canvas camera={{ position: [0, 2, 7], fov: 45 }}>
        <ambientLight intensity={1.4} />
        <pointLight position={[10, 6, 8]} intensity={100} />
        <pointLight position={[-8, -4, -6]} intensity={20} color="#1a4fff" />

        <EarthSphere />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />

        {layerVisibility.objects ? (
          <ObjectLayer
            objects={objects}
            selectedObjectId={selectedObjectId}
            onSelectObject={onSelectObject}
          />
        ) : null}
        {layerVisibility.conjunctions ? (
          <ConjunctionLayer
            conjunctions={conjunctions}
            objects={objects}
            selectedConjunctionId={selectedConjunctionId}
            onSelectConjunction={onSelectConjunction}
          />
        ) : null}
        {layerVisibility.heatmap ? <HeatmapLayer bins={heatmapBins} /> : null}
        {layerVisibility.orbit && selectedObject ? (
          <OrbitLayer
            points={
              trajectory?.points.map((p) => toScenePosition(p.positionKm)) ??
              [toScenePosition(selectedObject.positionKm)]
            }
            color={objectClassColor(selectedObject.objectClass)}
          />
        ) : null}
      </Canvas>
      <GlobeLegend />
    </div>
  );
}
