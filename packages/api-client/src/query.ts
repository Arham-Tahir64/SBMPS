import type { ConjunctionEventSummary, SimulationJobSummary, TrackedObjectSummary } from "@sdmps/domain";

import { listConjunctions } from "./endpoints/conjunctions";
import { getFeedStatus } from "./endpoints/feeds";
import { getLiveSnapshot, type LiveSnapshot } from "./endpoints/live";
import { listObjects } from "./endpoints/objects";
import { listSimulations } from "./endpoints/simulations";
import {
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
  conjunctions: ["conjunctions"] as const,
  simulations: ["simulations"] as const,
  feeds: ["feeds"] as const
};

async function withFallback<T>(fetcher: () => Promise<T>, fallback: T): Promise<QueryEnvelope<T>> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    return { data: fallback, isFallback: true };
  }

  try {
    const data = await fetcher();
    return { data, isFallback: false };
  } catch {
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

export async function getSimulationsWithFallback(): Promise<QueryEnvelope<SimulationJobSummary[]>> {
  return withFallback(listSimulations, sampleSimulationJobs);
}

export async function getFeedStatusWithFallback() {
  return withFallback(getFeedStatus, sampleFeedStatus);
}
