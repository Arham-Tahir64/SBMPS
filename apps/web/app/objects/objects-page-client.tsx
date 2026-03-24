"use client";

import { DataTablePlaceholder } from "@sdmps/ui";

import { useObjects } from "../../lib/queries/use-objects";
import { useOperationsStore } from "../../store/operations-store";

export function ObjectsPageClient() {
  const { data, isFallback, isLoading } = useObjects();
  const { selectedObjectId, selectObject } = useOperationsStore();

  return (
    <DataTablePlaceholder
      columns={["Name", "Class", "Risk", "Epoch"]}
      rows={data.map((item) => [item.name, item.objectClass, item.riskTier, item.epoch])}
      rowIds={data.map((item) => item.id)}
      selectedRowId={selectedObjectId}
      onRowClick={selectObject}
      caption={`Objects ${isFallback ? "· fallback" : "· api"}${isLoading ? " · loading" : ""}`}
    />
  );
}
