import type { ConjunctionEventDetail, ConjunctionEventSummary } from "@sdmps/domain";
import { defaultApiClient } from "../client";

export async function listConjunctions() {
  return defaultApiClient.get<ConjunctionEventSummary[]>("/v1/conjunctions");
}

export async function getConjunction(id: string) {
  return defaultApiClient.get<ConjunctionEventDetail>(`/v1/conjunctions/${id}`);
}
