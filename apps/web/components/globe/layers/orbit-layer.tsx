import { useMemo } from "react";
import * as THREE from "three";

type OrbitLayerProps = {
  points: [number, number, number][];
  color: string;
};

export function OrbitLayer({ points, color }: OrbitLayerProps) {
  const { geometry, headGeometry } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    if (points.length > 0) {
      geo.setFromPoints(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    }

    // Separate small sphere geometry for the leading-edge marker
    const headGeo = new THREE.SphereGeometry(0.028, 10, 10);
    return { geometry: geo, headGeometry: headGeo };
  }, [points]);

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.55,
        linewidth: 1,
      }),
    [color]
  );

  const headMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
      }),
    [color]
  );

  if (points.length === 0) return null;

  const head = points[0];

  return (
    <group>
      {/* Orbit arc */}
      <line args={[geometry, lineMaterial]} />

      {/* Leading-edge dot at current position */}
      {head ? (
        <mesh geometry={headGeometry} material={headMaterial} position={head} />
      ) : null}
    </group>
  );
}
