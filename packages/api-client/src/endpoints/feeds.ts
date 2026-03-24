import type { FeedStatus } from "@sdmps/domain";
import { defaultApiClient } from "../client";

export async function getFeedStatus() {
  return defaultApiClient.get<FeedStatus[]>("/v1/feeds/status");
}

export async function refreshFeeds() {
  return defaultApiClient.post<FeedStatus[]>("/v1/feeds/refresh");
}
