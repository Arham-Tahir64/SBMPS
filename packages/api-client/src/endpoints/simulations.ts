import type { SimulationJobSummary } from "@sdmps/domain";
import { defaultApiClient } from "../client";

export type CreateSimulationInput = {
  scenarioName: string;
  durationDays: number;
  objectSampleSize: number;
  stepHours: number;
};

export async function listSimulations() {
  return defaultApiClient.get<SimulationJobSummary[]>("/v1/simulations");
}

export async function createSimulation(input: CreateSimulationInput) {
  return defaultApiClient.post<SimulationJobSummary>("/v1/simulations", input);
}
