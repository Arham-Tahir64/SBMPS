import type { AlertEvent } from "@sdmps/domain";
import { defaultApiClient } from "../client";

export async function listAlerts() {
  return defaultApiClient.get<AlertEvent[]>("/v1/alerts");
}
