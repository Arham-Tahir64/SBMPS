"use client";

import type { FilterDefinition } from "@sdmps/api-client";
import type { FeedStatus } from "@sdmps/domain";
import type { LayerVisibility } from "../../store/operations-store";
import { ShellSection, StateNotice } from "@sdmps/ui";

type FilterPanelProps = {
  filters: FilterDefinition[];
  epoch: string;
  feeds: FeedStatus[];
  layerVisibility: LayerVisibility;
  toggleLayer: (layer: keyof LayerVisibility) => void;
  isFallback: boolean;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefreshFeeds?: () => void;
  objectCount: number;
  conjunctionCount: number;
  selectedObjectName?: string;
  hasRequestError?: boolean;
};

function formatTimestamp(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }

  return new Date(timestamp).toLocaleString();
}

export function FilterPanel({
  filters,
  epoch,
  feeds,
  layerVisibility,
  toggleLayer,
  isFallback,
  isLoading,
  isRefreshing,
  onRefreshFeeds,
  objectCount,
  conjunctionCount,
  selectedObjectName,
  hasRequestError
}: FilterPanelProps) {
  const staleFeedCount = feeds.filter((item) => item.isStale).length;
  const layerMeta: Record<keyof LayerVisibility, { label: string; summary: string }> = {
    objects: {
      label: "Tracked Objects",
      summary: objectCount > 0 ? `${objectCount} available in snapshot` : "Refresh the feed to seed persisted objects"
    },
    conjunctions: {
      label: "Conjunction Markers",
      summary:
        conjunctionCount > 0 ? `${conjunctionCount} active events` : "No persisted conjunction watchlist exists yet"
    },
    heatmap: {
      label: "Altitude Heatmap",
      summary: objectCount > 0 ? "Derived from current orbital density" : "Unavailable without object data"
    },
    orbit: {
      label: "Selected Orbit",
      summary: selectedObjectName ? `Tracking ${selectedObjectName}` : "Select an object to project an orbit"
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ShellSection title="Live Data">
        <div>{isFallback ? "Fallback placeholder data" : "Backend API snapshot"}</div>
        <div style={{ color: "var(--muted)", marginTop: 6 }}>
          Epoch {formatTimestamp(epoch)}
          {isLoading ? " · refreshing" : ""}
        </div>
        {onRefreshFeeds ? (
          <button
            type="button"
            onClick={onRefreshFeeds}
            disabled={isRefreshing}
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(121, 178, 255, 0.22)",
              background: "rgba(83, 194, 255, 0.12)",
              color: "var(--text)",
              cursor: isRefreshing ? "wait" : "pointer"
            }}
          >
            {isRefreshing ? "Refreshing feed..." : "Refresh CelesTrak feed"}
          </button>
        ) : null}
        <div style={{ display: "grid", gap: 6, marginTop: 12 }}>
          <div>{objectCount} tracked objects available</div>
          <div>{conjunctionCount} conjunctions available</div>
          <div>
            {feeds.length} feed sources reported
            {feeds.length > 0 ? ` · ${staleFeedCount} stale` : ""}
          </div>
        </div>
        {hasRequestError ? (
          <div style={{ color: "var(--muted)", marginTop: 10 }}>
            Latest request failed. Cached or fallback state is still rendered.
          </div>
        ) : null}
        {!isLoading && !isFallback && objectCount === 0 && feeds.length === 0 ? (
          <div style={{ color: "var(--muted)", marginTop: 10 }}>
            No persisted live state exists yet. Refresh the feed to seed tracked objects and feed telemetry.
          </div>
        ) : null}
      </ShellSection>
      <ShellSection title="Feed Status">
        {feeds.length === 0 ? (
          <StateNotice title="Feed State" tone={isFallback ? "warning" : "neutral"}>
            {isFallback
              ? "Fallback snapshot did not include persisted feed telemetry."
              : "No persisted feed state exists yet. Refresh the feed to seed tracked objects and telemetry."}
          </StateNotice>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {feeds.map((feed) => (
              <div
                key={feed.source}
                style={{
                  border: "1px solid rgba(121, 178, 255, 0.14)",
                  borderRadius: 12,
                  padding: 12,
                  background: feed.isStale ? "rgba(255, 157, 66, 0.08)" : "rgba(78, 212, 168, 0.05)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <strong>{feed.source}</strong>
                  <span style={{ color: feed.isStale ? "#ff9d42" : "#4ed4a8" }}>
                    {feed.isStale ? "Stale" : "Healthy"}
                  </span>
                </div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>
                  Last ingest {formatTimestamp(feed.lastIngestedAt)}
                </div>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>
                  Stale threshold {feed.staleThresholdMinutes} minutes
                </div>
                <div style={{ color: "var(--muted)", marginTop: 4 }}>
                  Objects available {feed.objectCount ?? 0}
                </div>
                {feed.message ? (
                  <div style={{ color: "#ff9d42", marginTop: 6 }}>
                    {feed.message}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </ShellSection>
      {filters.map((filter) => (
        <ShellSection key={filter.id} title={filter.label}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {filter.options.map((option) => (
              <span
                key={option}
                style={{
                  border: "1px solid rgba(121, 178, 255, 0.22)",
                  borderRadius: 999,
                  padding: "6px 10px",
                  color: "var(--muted)"
                }}
              >
                {option}
              </span>
            ))}
          </div>
        </ShellSection>
      ))}
      <ShellSection title="Layers">
        <div style={{ display: "grid", gap: 8 }}>
          {Object.entries(layerVisibility).map(([layer, visible]) => (
            <button
              key={layer}
              type="button"
              onClick={() => toggleLayer(layer as keyof LayerVisibility)}
              aria-pressed={visible}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(121, 178, 255, 0.22)",
                background: visible ? "rgba(83, 194, 255, 0.12)" : "transparent",
                color: "var(--text)",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {layerMeta[layer as keyof LayerVisibility].label}: {visible ? "on" : "off"}
              </div>
              <div style={{ color: "var(--muted)", marginTop: 4 }}>
                {layerMeta[layer as keyof LayerVisibility].summary}
              </div>
            </button>
          ))}
        </div>
      </ShellSection>
    </div>
  );
}
