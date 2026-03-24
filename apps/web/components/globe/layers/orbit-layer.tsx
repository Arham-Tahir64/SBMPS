type OrbitLayerProps = {
  points: [number, number, number][];
  color: string;
};

export function OrbitLayer({ points, color }: OrbitLayerProps) {
  if (points.length === 0) {
    return null;
  }

  return (
    <group>
      {points.map((point) => (
        <mesh key={`${color}-${point.join("-")}`} position={point}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}
