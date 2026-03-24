import type { DashboardSummary } from "@sdmps/domain";
import { defaultApiClient } from "../client";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return defaultApiClient.get<DashboardSummary>("/v1/dashboard/summary");
}
