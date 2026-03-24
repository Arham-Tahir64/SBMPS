import type { SimulationJobSummary } from "@sdmps/domain";
import { defaultApiClient } from "../client";

export async function listSimulations() {
  return defaultApiClient.get<SimulationJobSummary[]>("/v1/simulations");
}
