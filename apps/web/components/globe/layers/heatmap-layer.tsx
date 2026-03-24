import { useMemo } from "react";
import * as THREE from "three";
import type { HeatmapBin } from "@sdmps/domain";

// Earth radius in scene units — matches the globe sphere radius of 2.
// toScenePosition divides km by 3400, so Earth surface ≈ 6371/3400 ≈ 1.874.
// We use 2 as the authoritative globe radius and apply the same 1/3400 scale.
const EARTH_RADIUS_KM = 6371;
const SCENE_SCALE = 1 / 3400;

function altitudeToSceneRadius(altitudeKm: number): number {
  return (EARTH_RADIUS_KM + altitudeKm) * SCENE_SCALE;
}

function lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
  return new THREE.Color().lerpColors(a, b, t);
}

const COLOR_LOW  = new THREE.Color("#1a6fff"); // dense but safe — blue
const COLOR_HIGH = new THREE.Color("#ff3333"); // dense and risky — red

type HeatmapLayerProps = {
  bins: HeatmapBin[];
};

export function HeatmapLayer({ bins }: HeatmapLayerProps) {
  const shells = useMemo(() => {
    return bins
      .filter((bin) => bin.density > 0)
      .map((bin) => {
        const midAltitudeKm = (bin.bandStartKm + bin.bandEndKm) / 2;
        const radius = altitudeToSceneRadius(midAltitudeKm);
        const color = lerpColor(COLOR_LOW, COLOR_HIGH, bin.riskConcentration);
        // Opacity scales with density but stays subtle so objects stay visible
        const opacity = Math.min(0.38, bin.density * 0.7);
        return { key: bin.bandStartKm, radius, color, opacity };
      });
  }, [bins]);

  return (
    <>
      {shells.map(({ key, radius, color, opacity }) => (
        <mesh key={key}>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
            side={THREE.FrontSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}
