import type {
  AlertEvent,
  ConjunctionEventDetail,
  ConjunctionEventSummary,
  FeedStatus,
  RiskTier,
  SimulationJobSummary,
  TrackedObjectDetail,
  TrackedObjectSummary
} from "@sdmps/domain";
import type { LiveSnapshot } from "./endpoints/live";

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

export const sampleObjectDetails: Record<string, TrackedObjectDetail> = {
  "25544": {
    ...sampleObjects[0],
    velocityKmPerSecond: [7.66, 0.12, -0.03],
    operatorName: "NASA",
    source: "CelesTrak"
  },
  "40069": {
    ...sampleObjects[1],
    velocityKmPerSecond: [7.48, -0.21, 0.08],
    operatorName: undefined,
    source: "CelesTrak"
  },
  "33591": {
    ...sampleObjects[2],
    velocityKmPerSecond: [7.54, 0.18, -0.11],
    operatorName: undefined,
    source: "CelesTrak"
  }
};

export const sampleConjunctionDetails: Record<string, ConjunctionEventDetail> = {
  "cj-1": {
    ...sampleConjunctions[0],
    relativeVelocityKmPerSecond: 11.24,
    pcValue: 0.00031,
    methodology: "estimated"
  }
};

export const sampleFeedStatus: FeedStatus[] = [
  {
    source: "CelesTrak",
    lastIngestedAt: "2026-03-24T00:00:00Z",
    staleThresholdMinutes: 240,
    isStale: false,
    objectCount: 3,
    message: null
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

export const sampleLiveSnapshot: LiveSnapshot = {
  epoch: "2026-03-24T00:00:00Z",
  objects: sampleObjects,
  conjunctions: sampleConjunctions,
  feeds: sampleFeedStatus
};

export function getSampleObjectDetail(id: string): TrackedObjectDetail | undefined {
  return sampleObjectDetails[id];
}

export function getSampleConjunctionDetail(id: string): ConjunctionEventDetail | undefined {
  return sampleConjunctionDetails[id];
}

export const sampleFilters: FilterDefinition[] = [
  { id: "class", label: "Object Class", options: ["active-satellite", "rocket-body", "debris-fragment"] },
  { id: "risk", label: "Risk Tier", options: ["low", "medium", "high", "critical"] },
  { id: "source", label: "Feed Source", options: ["CelesTrak", "Space-Track"] }
];

export const sampleAlerts: AlertEvent[] = [
  {
    id: "conj-001-002-2026-03-24T06:00:00Z",
    kind: "conjunction",
    severity: "critical",
    message: "ISS (ZARYA) and SL-16 R/B are projected within 0.42 km.",
    createdAt: "2026-03-24T06:00:00Z"
  },
  {
    id: "conj-003-004-2026-03-24T09:30:00Z",
    kind: "conjunction",
    severity: "high",
    message: "STARLINK-1234 and COSMOS 2251 DEB are projected within 3.17 km.",
    createdAt: "2026-03-24T09:30:00Z"
  },
  {
    id: "feed-stale-celestrak",
    kind: "feed-stale",
    severity: "medium",
    message: "CelesTrak feed is stale (threshold: 240 min). Last ingested: 2026-03-24T02:00:00Z.",
    createdAt: "2026-03-24T02:00:00Z"
  }
];
