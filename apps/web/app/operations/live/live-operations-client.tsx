"use client";

import { sampleFilters } from "@sdmps/api-client";
import { useEffect } from "react";

import { useLiveSnapshot } from "../../../lib/queries/use-live-snapshot";
import { useOperationsStore } from "../../../store/operations-store";
import { AlertInbox } from "../../../components/alerts/alert-inbox";
import { GlobeViewport } from "../../../components/globe/globe-viewport";
import { OperatorShell } from "../../../components/layout/operator-shell";
import { ConjunctionInspector } from "../../../components/panels/conjunction-inspector";
import { FilterPanel } from "../../../components/panels/filter-panel";
import { ObjectInspector } from "../../../components/panels/object-inspector";

export function LiveOperationsClient() {
  const { data, isLoading, isFallback } = useLiveSnapshot();
  const {
    selectedObjectId,
    selectedConjunctionId,
    layerVisibility,
    selectObject,
    selectConjunction,
    toggleLayer
  } = useOperationsStore();

  useEffect(() => {
    if (!selectedObjectId && data.objects[0]) {
      selectObject(data.objects[0].id);
    }
  }, [data.objects, selectObject, selectedObjectId]);

  useEffect(() => {
    if (!selectedConjunctionId && data.conjunctions[0]) {
      selectConjunction(data.conjunctions[0].id);
    }
  }, [data.conjunctions, selectConjunction, selectedConjunctionId]);

  const selectedObject = data.objects.find((item) => item.id === selectedObjectId);
  const selectedConjunction = data.conjunctions.find((item) => item.id === selectedConjunctionId);

  return (
    <OperatorShell
      title="Live Operations"
      subtitle={`Epoch ${data.epoch}${isFallback ? " · fallback data" : " · api data"}${isLoading ? " · loading" : ""}`}
      leftPanel={
        <FilterPanel
          filters={sampleFilters}
          layerVisibility={layerVisibility}
          toggleLayer={toggleLayer}
          feedSummary={`${data.feeds.filter((item) => item.isStale).length} stale / ${data.feeds.length} feeds`}
          isFallback={isFallback}
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
          onSelectConjunction={selectConjunction}
        />
      }
      rightPanel={
        <div style={{ display: "grid", gap: 16 }}>
          <ObjectInspector object={selectedObject} isFallback={isFallback} />
          <ConjunctionInspector conjunction={selectedConjunction} isFallback={isFallback} />
        </div>
      }
      bottomPanel={<AlertInbox alerts={data.conjunctions} isFallback={isFallback} />}
    />
  );
}
