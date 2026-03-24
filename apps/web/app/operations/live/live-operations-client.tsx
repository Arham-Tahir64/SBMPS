"use client";

import { isApiBaseUrlConfigured, sampleFilters } from "@sdmps/api-client";
import { useEffect } from "react";

import { useConjunctionDetail } from "../../../lib/queries/use-conjunction-detail";
import { useFeedRefresh } from "../../../lib/queries/use-feed-refresh";
import { useLiveSnapshot } from "../../../lib/queries/use-live-snapshot";
import { useObjectDetail } from "../../../lib/queries/use-object-detail";
import { useOperationsStore } from "../../../store/operations-store";
import { AlertInbox } from "../../../components/alerts/alert-inbox";
import { GlobeViewport } from "../../../components/globe/globe-viewport";
import { OperatorShell } from "../../../components/layout/operator-shell";
import { ConjunctionInspector } from "../../../components/panels/conjunction-inspector";
import { FilterPanel } from "../../../components/panels/filter-panel";
import { ObjectInspector } from "../../../components/panels/object-inspector";

export function LiveOperationsClient() {
  const { data, error, isLoading, isFallback } = useLiveSnapshot();
  const apiConfigured = isApiBaseUrlConfigured();
  const refreshFeeds = useFeedRefresh();
  const {
    selectedObjectId,
    selectedConjunctionId,
    layerVisibility,
    selectObject,
    selectConjunction,
    clearObjectSelection,
    clearConjunctionSelection,
    toggleLayer
  } = useOperationsStore();
  const objectDetail = useObjectDetail(selectedObjectId);
  const conjunctionDetail = useConjunctionDetail(selectedConjunctionId);

  useEffect(() => {
    if (data.objects.length === 0) {
      if (selectedObjectId !== undefined) {
        clearObjectSelection();
      }
      return;
    }

    if (!selectedObjectId || !data.objects.some((item) => item.id === selectedObjectId)) {
      selectObject(data.objects[0].id);
    }
  }, [clearObjectSelection, data.objects, selectObject, selectedObjectId]);

  useEffect(() => {
    if (data.conjunctions.length === 0) {
      if (selectedConjunctionId !== undefined) {
        clearConjunctionSelection();
      }
      return;
    }

    if (!selectedConjunctionId || !data.conjunctions.some((item) => item.id === selectedConjunctionId)) {
      selectConjunction(data.conjunctions[0].id);
    }
  }, [clearConjunctionSelection, data.conjunctions, selectConjunction, selectedConjunctionId]);

  const selectedObject = data.objects.find((item) => item.id === selectedObjectId);
  const selectedConjunction = data.conjunctions.find((item) => item.id === selectedConjunctionId);
  const activeAlertCount = data.conjunctions.filter(
    (item) => item.riskTier === "high" || item.riskTier === "critical"
  ).length;
  const handleSelectConjunction = (conjunctionId?: string) => {
    selectConjunction(conjunctionId);

    if (!conjunctionId) {
      return;
    }

    const conjunction = data.conjunctions.find((item) => item.id === conjunctionId);
    if (conjunction) {
      selectObject(conjunction.primaryObjectId);
    }
  };

  return (
    <OperatorShell
      title="Live Operations"
      subtitle={`${data.objects.length} objects · ${data.conjunctions.length} conjunctions · ${activeAlertCount} active alerts · ${data.feeds.length} feeds${isFallback ? " · fallback data" : " · api data"}${isLoading ? " · loading" : ""}${!isLoading && data.objects.length === 0 && !isFallback ? " · awaiting persisted state" : ""}`}
      leftPanel={
        <FilterPanel
          filters={sampleFilters}
          epoch={data.epoch}
          feeds={data.feeds}
          layerVisibility={layerVisibility}
          toggleLayer={toggleLayer}
          isFallback={isFallback}
          isLoading={isLoading}
          isRefreshing={refreshFeeds.isPending}
          onRefreshFeeds={apiConfigured ? () => refreshFeeds.mutate() : undefined}
          objectCount={data.objects.length}
          conjunctionCount={data.conjunctions.length}
          selectedObjectName={selectedObject?.name}
          hasRequestError={Boolean(error)}
        />
      }
      centerPanel={
        <GlobeViewport
          objects={data.objects}
          conjunctions={data.conjunctions}
          selectedObjectId={selectedObjectId}
          selectedConjunctionId={selectedConjunctionId}
          layerVisibility={layerVisibility}
          onSelectObject={selectObject}
          onSelectConjunction={handleSelectConjunction}
        />
      }
      rightPanel={
        <div style={{ display: "grid", gap: 16 }}>
          <ObjectInspector
            object={selectedObject}
            detail={objectDetail.data}
            isLoading={objectDetail.isLoading}
            isFallback={isFallback || objectDetail.isFallback}
            hasDetailError={Boolean(objectDetail.error)}
          />
          <ConjunctionInspector
            conjunction={selectedConjunction}
            detail={conjunctionDetail.data}
            isLoading={conjunctionDetail.isLoading}
            isFallback={isFallback || conjunctionDetail.isFallback}
            hasDetailError={Boolean(conjunctionDetail.error)}
          />
        </div>
      }
      bottomPanel={
        <AlertInbox
          alerts={data.conjunctions}
          isFallback={isFallback}
          isLoading={isLoading}
          selectedAlertId={selectedConjunctionId}
          onSelectAlert={handleSelectConjunction}
        />
      }
    />
  );
}
