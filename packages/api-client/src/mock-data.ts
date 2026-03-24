import type {
  ConjunctionEventSummary,
  FeedStatus,
  RiskTier,
  SimulationJobSummary,
  TrackedObjectSummary
} from "@sdmps/domain";

export type FilterDefinition = {
  id: string;
  label: string;
  options: string[];
};

function object(id: string, name: string, objectClass: TrackedObjectSummary["objectClass"], riskTier: RiskTier, positionKm: [number, number, number]): TrackedObjectSummary {
  return {
    id,
    name,
    noradId: Number(id.replace(/\D/g, "")) || 10000,
    objectClass,
    riskTier,
    epoch: "2026-03-24T00:00:00Z",
    positionKm
  };
}

export const sampleObjects: TrackedObjectSummary[] = [
  object("25544", "ISS", "active-satellite", "low", [6800, 200, 50]),
  object("40069", "FENGYUN FRAG", "debris-fragment", "high", [6900, -200, 120]),
  object("33591", "IRIDIUM DEB", "debris-fragment", "medium", [6650, 250, -180])
];

export const sampleConjunctions: ConjunctionEventSummary[] = [
  {
    id: "cj-1",
    primaryObjectId: "25544",
    primaryObjectName: "ISS",
    secondaryObjectId: "40069",
    secondaryObjectName: "FENGYUN FRAG",
    missDistanceKm: 3.42,
    tca: "2026-03-24T12:15:00Z",
    riskTier: "high"
  }
];

export const sampleFeedStatus: FeedStatus[] = [
  {
    source: "CelesTrak",
    lastIngestedAt: "2026-03-24T00:00:00Z",
    staleThresholdMinutes: 240,
    isStale: false
  }
];

export const sampleSimulationJobs: SimulationJobSummary[] = [
  {
    id: "sim-1",
    scenarioName: "LEO ten-year baseline",
    status: "queued",
    createdAt: "2026-03-24T01:00:00Z"
  }
];

export const sampleFilters: FilterDefinition[] = [
  { id: "class", label: "Object Class", options: ["active-satellite", "rocket-body", "debris-fragment"] },
  { id: "risk", label: "Risk Tier", options: ["low", "medium", "high", "critical"] },
  { id: "source", label: "Feed Source", options: ["CelesTrak", "Space-Track"] }
];
