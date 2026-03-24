export function HeatmapLayer() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
      <ringGeometry args={[2.4, 2.8, 64]} />
      <meshBasicMaterial color="#1a4f8f" opacity={0.18} transparent />
    </mesh>
  );
}
