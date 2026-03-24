import type {
  AlertEvent,
  ConjunctionEventDetail,
  ConjunctionEventSummary,
  DashboardSummary,
  SimulationJobSummary,
  TrackedObjectDetail,
  TrackedObjectSummary
} from "@sdmps/domain";

import { listAlerts } from "./endpoints/alerts";
import { getDashboardSummary } from "./endpoints/dashboard";
import { getConjunction, listConjunctions } from "./endpoints/conjunctions";
import { getFeedStatus } from "./endpoints/feeds";
import { getLiveSnapshot, type LiveSnapshot } from "./endpoints/live";
import { getObject, listObjects } from "./endpoints/objects";
import { listSimulations } from "./endpoints/simulations";
import {
  getSampleConjunctionDetail,
  getSampleObjectDetail,
  sampleAlerts,
  sampleConjunctions,
  sampleFeedStatus,
  sampleLiveSnapshot,
  sampleObjects,
  sampleSimulationJobs
} from "./mock-data";

export type QueryEnvelope<T> = {
  data: T;
  isFallback: boolean;
};

export const queryKeys = {
  live: ["live"] as const,
  objects: ["objects"] as const,
  objectDetail: (id: string) => ["objects", id] as const,
  conjunctions: ["conjunctions"] as const,
  conjunctionDetail: (id: string) => ["conjunctions", id] as const,
  simulations: ["simulations"] as const,
  feeds: ["feeds"] as const,
  alerts: ["alerts"] as const,
  dashboard: ["dashboard"] as const
};

export function isApiBaseUrlConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);
}

async function withFallback<T>(
  fetcher: () => Promise<T>,
  fallback?: T
): Promise<QueryEnvelope<T>> {
  if (!isApiBaseUrlConfigured()) {
    if (fallback === undefined) {
      throw new Error("API base URL is not configured");
    }

    return { data: fallback, isFallback: true };
  }

  const data = await fetcher();
  return { data, isFallback: false };
}

export async function getLiveSnapshotWithFallback(): Promise<QueryEnvelope<LiveSnapshot>> {
  return withFallback(getLiveSnapshot, sampleLiveSnapshot);
}

export async function getObjectsWithFallback(): Promise<QueryEnvelope<TrackedObjectSummary[]>> {
  return withFallback(listObjects, sampleObjects);
}

export async function getConjunctionsWithFallback(): Promise<QueryEnvelope<ConjunctionEventSummary[]>> {
  return withFallback(listConjunctions, sampleConjunctions);
}

export async function getObjectWithFallback(id: string): Promise<QueryEnvelope<TrackedObjectDetail>> {
  return withFallback(() => getObject(id), getSampleObjectDetail(id));
}

export async function getConjunctionWithFallback(
  id: string
): Promise<QueryEnvelope<ConjunctionEventDetail>> {
  return withFallback(() => getConjunction(id), getSampleConjunctionDetail(id));
}

export async function getSimulationsWithFallback(): Promise<QueryEnvelope<SimulationJobSummary[]>> {
  return withFallback(listSimulations, sampleSimulationJobs);
}

export async function getFeedStatusWithFallback() {
  return withFallback(getFeedStatus, sampleFeedStatus);
}

export async function getAlertsWithFallback(): Promise<QueryEnvelope<AlertEvent[]>> {
  return withFallback(listAlerts, sampleAlerts);
}

export async function getDashboardSummaryWithFallback(): Promise<QueryEnvelope<DashboardSummary>> {
  return withFallback(getDashboardSummary, {
    epoch: new Date().toISOString(),
    trackedObjectCount: 3,
    highRiskConjunctionCount: 1,
    criticalRiskConjunctionCount: 0,
    activeFeedCount: 1,
    staleFeedCount: 0,
  });
}
