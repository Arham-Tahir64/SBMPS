export type RiskTier = "low" | "medium" | "high" | "critical";
export type ObjectClass = "active-satellite" | "rocket-body" | "debris-fragment";

export type TrackedObjectSummary = {
  id: string;
  name: string;
  noradId: number;
  objectClass: ObjectClass;
  riskTier: RiskTier;
  epoch: string;
  positionKm: [number, number, number];
};

export type TrackedObjectDetail = TrackedObjectSummary & {
  velocityKmPerSecond: [number, number, number];
  operatorName?: string;
  source: string;
};

export type ConjunctionEventSummary = {
  id: string;
  primaryObjectId: string;
  primaryObjectName: string;
  secondaryObjectId: string;
  secondaryObjectName: string;
  missDistanceKm: number;
  tca: string;
  riskTier: RiskTier;
};

export type ConjunctionEventDetail = ConjunctionEventSummary & {
  relativeVelocityKmPerSecond: number;
  pcValue?: number;
  methodology: "estimated" | "covariance-backed";
};

export type HeatmapBin = {
  bandStartKm: number;
  bandEndKm: number;
  density: number;
  riskConcentration: number;
};

export type FeedStatus = {
  source: string;
  lastIngestedAt: string;
  staleThresholdMinutes: number;
  isStale: boolean;
  objectCount?: number | null;
  message?: string | null;
};

export type AlertEvent = {
  id: string;
  kind: "conjunction" | "feed-stale" | "simulation-complete";
  severity: RiskTier;
  message: string;
  createdAt: string;
};

export type TrajectoryPoint = {
  t: string;
  positionKm: [number, number, number];
};

export type ObjectTrajectory = {
  objectId: string;
  stepSeconds: number;
  points: TrajectoryPoint[];
};

export type DashboardSummary = {
  epoch: string;
  trackedObjectCount: number;
  highRiskConjunctionCount: number;
  criticalRiskConjunctionCount: number;
  activeFeedCount: number;
  staleFeedCount: number;
};

export type SimulationJobSummary = {
  id: string;
  scenarioName: string;
  status: "queued" | "running" | "completed" | "failed";
  createdAt: string;
  durationDays: number;
  objectSampleSize: number;
  stepHours: number;
  startedAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
  conjunctionsDetected?: number | null;
  criticalCount?: number | null;
  highCount?: number | null;
  objectsAnalyzed?: number | null;
};

export const riskTierLabel: Record<RiskTier, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

export function formatDistanceKm(distanceKm: number): string {
  return `${distanceKm.toFixed(2)} km`;
}
