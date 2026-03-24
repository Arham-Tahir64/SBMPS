import type {
  ConjunctionEventDetail,
  ConjunctionEventSummary,
  SimulationJobSummary,
  TrackedObjectDetail,
  TrackedObjectSummary
} from "@sdmps/domain";

import { getConjunction, listConjunctions } from "./endpoints/conjunctions";
import { getFeedStatus } from "./endpoints/feeds";
import { getLiveSnapshot, type LiveSnapshot } from "./endpoints/live";
import { getObject, listObjects } from "./endpoints/objects";
import { listSimulations } from "./endpoints/simulations";
import {
  getSampleConjunctionDetail,
  getSampleObjectDetail,
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
  feeds: ["feeds"] as const
};

async function withFallback<T>(
  fetcher: () => Promise<T>,
  fallback?: T
): Promise<QueryEnvelope<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    if (fallback === undefined) {
      throw new Error("API base URL is not configured");
    }

    return { data: fallback, isFallback: true };
  }

  try {
    const data = await fetcher();
    return { data, isFallback: false };
  } catch {
    if (fallback === undefined) {
      throw new Error("Request failed and no fallback data exists");
    }

    return { data: fallback, isFallback: true };
  }
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
