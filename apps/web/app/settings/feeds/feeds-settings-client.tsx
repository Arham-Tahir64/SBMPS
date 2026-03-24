"use client";

import { isApiBaseUrlConfigured } from "@sdmps/api-client";
import { ShellSection, StateNotice } from "@sdmps/ui";

import { useFeedRefresh } from "../../../lib/queries/use-feed-refresh";
import { useFeedStatus } from "../../../lib/queries/use-feed-status";

function formatUtc(value: string | null | undefined): string {
  if (!value) return "Never";
  return new Date(value).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export function FeedsSettingsClient() {
  const { data: feeds, isFallback, isLoading, error } = useFeedStatus();
  const refresh = useFeedRefresh();
  const apiConfigured = isApiBaseUrlConfigured();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {isFallback ? (
        <StateNotice title="Mode" tone="warning">
          Showing fallback feed data — API is unavailable or not yet configured.
        </StateNotice>
      ) : null}

      {error ? (
        <StateNotice title="Error" tone="warning">
          Latest request failed. Displaying cached data if available.
        </StateNotice>
      ) : null}

      <ShellSection title="Actions">
        <div style={{ display: "grid", gap: 8 }}>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
            Trigger an immediate TLE ingest from CelesTrak. The worker also polls automatically on
            the configured interval (default: 60 min).
          </p>
          {apiConfigured ? (
            <button
              type="button"
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending}
              style={{
                width: "fit-content",
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid rgba(121, 178, 255, 0.22)",
                background: refresh.isPending ? "rgba(83, 194, 255, 0.06)" : "rgba(83, 194, 255, 0.12)",
                color: "var(--text)",
                cursor: refresh.isPending ? "wait" : "pointer",
                fontSize: 13
              }}
            >
              {refresh.isPending ? "Refreshing…" : "Refresh CelesTrak feed now"}
            </button>
          ) : (
            <p style={{ margin: 0, color: "var(--muted)", fontSize: 13 }}>
              Feed refresh unavailable — API base URL not configured.
            </p>
          )}
          {refresh.isSuccess ? (
            <p style={{ margin: 0, color: "var(--success)", fontSize: 13 }}>
              Feed refreshed successfully.
            </p>
          ) : null}
          {refresh.isError ? (
            <p style={{ margin: 0, color: "var(--danger)", fontSize: 13 }}>
              Refresh failed. Check the API logs.
            </p>
          ) : null}
        </div>
      </ShellSection>

      <ShellSection title="Feed Sources">
        {isLoading && feeds.length === 0 ? (
          <p style={{ margin: 0, color: "var(--muted)" }}>Loading feed statuses…</p>
        ) : feeds.length === 0 ? (
          <StateNotice title="Empty" tone="neutral">
            No feed records found. Run a refresh to seed feed telemetry.
          </StateNotice>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {feeds.map((feed) => (
              <div
                key={feed.source}
                style={{
                  border: `1px solid ${feed.isStale ? "rgba(255, 157, 66, 0.28)" : "rgba(78, 212, 168, 0.2)"}`,
                  borderRadius: 12,
                  padding: 14,
                  background: feed.isStale ? "rgba(255, 157, 66, 0.06)" : "rgba(78, 212, 168, 0.04)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <strong style={{ fontSize: 14 }}>{feed.source}</strong>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: feed.isStale ? "var(--risk-high, #ff9d42)" : "var(--risk-low, #4ed4a8)"
                    }}
                  >
                    {feed.isStale ? "Stale" : "Healthy"}
                  </span>
                </div>
                <div style={{ display: "grid", gap: 4, fontSize: 13, color: "var(--muted)" }}>
                  <div>Last ingested: <span style={{ color: "var(--text)" }}>{formatUtc(feed.lastIngestedAt)}</span></div>
                  <div>Stale threshold: <span style={{ color: "var(--text)" }}>{feed.staleThresholdMinutes} min</span></div>
                  <div>Objects tracked: <span style={{ color: "var(--text)" }}>{feed.objectCount ?? 0}</span></div>
                  {feed.message ? (
                    <div style={{ color: "var(--warn)", marginTop: 4 }}>{feed.message}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </ShellSection>
    </div>
  );
}
