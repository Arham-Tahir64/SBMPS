import type { ConjunctionEventSummary, FeedStatus, TrackedObjectSummary } from "@sdmps/domain";
import { defaultApiClient } from "../client";

export type LiveSnapshot = {
  epoch: string;
  objects: TrackedObjectSummary[];
  conjunctions: ConjunctionEventSummary[];
  feeds: FeedStatus[];
};

export async function getLiveSnapshot() {
  return defaultApiClient.get<LiveSnapshot>("/v1/live/snapshot");
}
