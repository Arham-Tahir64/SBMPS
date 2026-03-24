import type { ObjectTrajectory, TrackedObjectDetail, TrackedObjectSummary } from "@sdmps/domain";
import { defaultApiClient } from "../client";

export async function listObjects() {
  return defaultApiClient.get<TrackedObjectSummary[]>("/v1/objects");
}

export async function getObject(id: string) {
  return defaultApiClient.get<TrackedObjectDetail>(`/v1/objects/${id}`);
}

export async function getObjectTrajectory(id: string, minutes = 90) {
  return defaultApiClient.get<ObjectTrajectory>(`/v1/objects/${id}/trajectory?minutes=${minutes}`);
}
