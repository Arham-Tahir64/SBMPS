"use client";

import type { AlertEvent } from "@sdmps/domain";
import { ShellSection, StateNotice, StatusChip } from "@sdmps/ui";

import { useAlerts } from "../../lib/queries/use-alerts";

const KIND_LABEL: Record<AlertEvent["kind"], string> = {
  conjunction: "Conjunction",
  "feed-stale": "Feed Stale",
  "simulation-complete": "Simulation"
};

function AlertRow({ alert }: { alert: AlertEvent }) {
  return (
    <div
      style={{
        border: "1px solid rgba(121, 178, 255, 0.14)",
        borderRadius: 14,
        padding: 14,
        background: "rgba(255, 255, 255, 0.01)",
        display: "grid",
        gap: 8
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {KIND_LABEL[alert.kind] ?? alert.kind}
          </span>
          <StatusChip tone={alert.severity as AlertEvent["severity"]}>{alert.severity}</StatusChip>
        </div>
        <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "monospace" }}>
          {new Date(alert.createdAt).toISOString().replace("T", " ").slice(0, 19)} UTC
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5 }}>{alert.message}</p>
    </div>
  );
}

export function AlertsPageClient() {
  const { data: alerts, isFallback, isLoading, error } = useAlerts();

  const critical = alerts.filter((a) => a.severity === "critical");
  const high = alerts.filter((a) => a.severity === "high");
  const rest = alerts.filter((a) => a.severity !== "critical" && a.severity !== "high");

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {isFallback ? (
        <StateNotice title="Mode" tone="warning">
          Showing fallback alert data — API is unavailable or not yet configured.
        </StateNotice>
      ) : null}

      {error ? (
        <StateNotice title="Error" tone="warning">
          Latest request failed. Displaying cached data if available.
        </StateNotice>
      ) : null}

      <ShellSection title="Status">
        <div style={{ color: isLoading ? "var(--muted)" : "var(--text)" }}>
          {isLoading
            ? "Loading alerts…"
            : `${alerts.length} alert${alerts.length !== 1 ? "s" : ""} active · ${critical.length} critical · ${high.length} high`}
        </div>
      </ShellSection>

      {!isLoading && alerts.length === 0 ? (
        <StateNotice title="Clear" tone="neutral">
          No active alerts. All tracked conjunction events are below risk thresholds.
        </StateNotice>
      ) : null}

      {critical.length > 0 ? (
        <ShellSection title="Critical">
          <div style={{ display: "grid", gap: 10 }}>
            {critical.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>
        </ShellSection>
      ) : null}

      {high.length > 0 ? (
        <ShellSection title="High">
          <div style={{ display: "grid", gap: 10 }}>
            {high.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>
        </ShellSection>
      ) : null}

      {rest.length > 0 ? (
        <ShellSection title="Other">
          <div style={{ display: "grid", gap: 10 }}>
            {rest.map((alert) => (
              <AlertRow key={alert.id} alert={alert} />
            ))}
          </div>
        </ShellSection>
      ) : null}
    </div>
  );
}
