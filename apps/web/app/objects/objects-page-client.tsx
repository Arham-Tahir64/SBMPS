"use client";

import { useEffect } from "react";

import { DataTablePlaceholder, ShellSection, StateNotice } from "@sdmps/ui";

import { ObjectInspector } from "../../components/panels/object-inspector";
import { useObjectDetail } from "../../lib/queries/use-object-detail";
import { useObjects } from "../../lib/queries/use-objects";
import { useOperationsStore } from "../../store/operations-store";

export function ObjectsPageClient() {
  const { data, error, isFallback, isLoading } = useObjects();
  const { selectedObjectId, selectObject, clearObjectSelection } = useOperationsStore();
  const selectedObject = data.find((item) => item.id === selectedObjectId);
  const objectDetail = useObjectDetail(selectedObjectId);

  useEffect(() => {
    if (data.length === 0) {
      clearObjectSelection();
      return;
    }

    if (!selectedObjectId || !data.some((item) => item.id === selectedObjectId)) {
      selectObject(data[0].id);
    }
  }, [clearObjectSelection, data, selectObject, selectedObjectId]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ShellSection title="Catalog Status">
        <div>
          {data.length} tracked objects available
          {isFallback ? " from fallback placeholder data" : " from the API"}
          {isLoading ? " · refreshing" : ""}
        </div>
        {error ? (
          <div style={{ color: "var(--muted)", marginTop: 6 }}>
            Latest request failed, continuing with cached or fallback data.
          </div>
        ) : null}
        {!isLoading && data.length === 0 && !isFallback ? (
          <div style={{ color: "var(--muted)", marginTop: 6 }}>
            No persisted object state is available yet. Refresh the feed to seed the catalog.
          </div>
        ) : null}
      </ShellSection>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)",
          gap: 16,
          alignItems: "start"
        }}
      >
        <DataTablePlaceholder
          columns={["Name", "Class", "Risk", "Epoch"]}
          rows={data.map((item) => [item.name, item.objectClass, item.riskTier, item.epoch])}
          rowIds={data.map((item) => item.id)}
          selectedRowId={selectedObjectId}
          onRowClick={selectObject}
          caption={`Objects · ${data.length} rows${isFallback ? " · fallback" : " · api"}${isLoading ? " · loading" : ""}${selectedObject ? ` · selected ${selectedObject.name}` : ""}`}
          emptyMessage="No tracked objects were returned."
          isLoading={isLoading && data.length === 0}
          loadingMessage="Loading persisted tracked objects..."
        />
        <div style={{ display: "grid", gap: 12 }}>
          {!selectedObject && data.length > 0 ? (
            <StateNotice title="Selection" tone="info">
              Choose an object from the table to inspect its current propagated state.
            </StateNotice>
          ) : null}
          <ObjectInspector
            object={selectedObject}
            detail={objectDetail.data}
            isLoading={objectDetail.isLoading}
            isFallback={isFallback || objectDetail.isFallback}
            hasDetailError={Boolean(objectDetail.error)}
          />
        </div>
      </div>
    </div>
  );
}
