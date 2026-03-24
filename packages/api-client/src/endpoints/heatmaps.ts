import type { HeatmapBin } from "@sdmps/domain";
import { defaultApiClient } from "../client";

export async function getAltitudeHeatmap() {
  return defaultApiClient.get<HeatmapBin[]>("/v1/heatmaps/altitude");
}
