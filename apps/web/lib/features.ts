export function isSimulationsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FEATURE_SIMULATIONS === "true";
}
