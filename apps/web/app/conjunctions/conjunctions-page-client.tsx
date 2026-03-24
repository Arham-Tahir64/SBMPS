"use client";

import { DataTablePlaceholder } from "@sdmps/ui";

import { useConjunctions } from "../../lib/queries/use-conjunctions";
import { useOperationsStore } from "../../store/operations-store";

export function ConjunctionsPageClient() {
  const { data, isFallback, isLoading } = useConjunctions();
  const { selectedConjunctionId, selectConjunction } = useOperationsStore();

  return (
    <DataTablePlaceholder
      columns={["Primary", "Secondary", "Miss Distance", "TCA", "Risk"]}
      rows={data.map((item) => [
        item.primaryObjectName,
        item.secondaryObjectName,
        `${item.missDistanceKm.toFixed(2)} km`,
        item.tca,
        item.riskTier
      ])}
      rowIds={data.map((item) => item.id)}
      selectedRowId={selectedConjunctionId}
      onRowClick={selectConjunction}
      caption={`Conjunctions ${isFallback ? "· fallback" : "· api"}${isLoading ? " · loading" : ""}`}
    />
  );
}
