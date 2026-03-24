"use client";

import { useEffect } from "react";

import { DataTablePlaceholder, ShellSection, StateNotice } from "@sdmps/ui";

import { ConjunctionInspector } from "../../components/panels/conjunction-inspector";
import { useConjunctionDetail } from "../../lib/queries/use-conjunction-detail";
import { useConjunctions } from "../../lib/queries/use-conjunctions";
import { useOperationsStore } from "../../store/operations-store";

export function ConjunctionsPageClient() {
  const { data, error, isFallback, isLoading } = useConjunctions();
  const { selectedConjunctionId, selectConjunction, clearConjunctionSelection } = useOperationsStore();
  const selectedConjunction = data.find((item) => item.id === selectedConjunctionId);
  const conjunctionDetail = useConjunctionDetail(selectedConjunctionId);

  useEffect(() => {
    if (data.length === 0) {
      clearConjunctionSelection();
      return;
    }

    if (!selectedConjunctionId || !data.some((item) => item.id === selectedConjunctionId)) {
      selectConjunction(data[0].id);
    }
  }, [clearConjunctionSelection, data, selectConjunction, selectedConjunctionId]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ShellSection title="Watchlist Status">
        <div>
          {data.length} conjunction events available
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
            No persisted conjunction watchlist exists yet.
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
          caption={`Conjunctions · ${data.length} rows${isFallback ? " · fallback" : " · api"}${isLoading ? " · loading" : ""}${selectedConjunction ? ` · selected ${selectedConjunction.primaryObjectName}` : ""}`}
          emptyMessage="No persisted conjunction watchlist exists yet."
          isLoading={isLoading && data.length === 0}
          loadingMessage="Loading persisted conjunction watchlist..."
        />
        <div style={{ display: "grid", gap: 12 }}>
          {!selectedConjunction && data.length > 0 ? (
            <StateNotice title="Selection" tone="info">
              Choose a conjunction to inspect the miss distance, TCA, and detail payload.
            </StateNotice>
          ) : null}
          <ConjunctionInspector
            conjunction={selectedConjunction}
            detail={conjunctionDetail.data}
            isLoading={conjunctionDetail.isLoading}
            isFallback={isFallback || conjunctionDetail.isFallback}
            hasDetailError={Boolean(conjunctionDetail.error)}
          />
        </div>
      </div>
    </div>
  );
}
