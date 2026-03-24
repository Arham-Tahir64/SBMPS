"use client";

import type { ConjunctionEventSummary } from "@sdmps/domain";
import { ShellSection, StateNotice, StatusChip } from "@sdmps/ui";

export function AlertInbox({
  alerts,
  isFallback,
  isLoading,
  selectedAlertId,
  onSelectAlert
}: {
  alerts: ConjunctionEventSummary[];
  isFallback?: boolean;
  isLoading?: boolean;
  selectedAlertId?: string;
  onSelectAlert?: (alertId: string) => void;
}) {
  const activeAlerts = alerts.filter((alert) => alert.riskTier === "high" || alert.riskTier === "critical");

  if (isLoading && activeAlerts.length === 0) {
    return <ShellSection title="Alerts">Loading conjunction alerts from the current snapshot.</ShellSection>;
  }

  if (activeAlerts.length === 0) {
    return (
      <ShellSection title="Alerts">
        {isFallback
          ? "Fallback snapshot has no high-risk conjunction alerts."
          : "No high-risk conjunction alerts currently active."}
      </ShellSection>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {isFallback ? (
        <StateNotice title="Mode" tone="warning">
          Showing fallback alert data because the API is unavailable.
        </StateNotice>
      ) : null}
      {activeAlerts.map((alert) => (
        <button
          key={alert.id}
          type="button"
          onClick={() => onSelectAlert?.(alert.id)}
          aria-pressed={selectedAlertId === alert.id}
          style={{
            textAlign: "left",
            border: "1px solid rgba(121, 178, 255, 0.14)",
            borderRadius: 16,
            padding: 14,
            background: selectedAlertId === alert.id ? "rgba(83, 194, 255, 0.08)" : "rgba(255, 255, 255, 0.01)",
            color: "var(--text)",
            cursor: onSelectAlert ? "pointer" : "default"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <strong>
              {alert.primaryObjectName} / {alert.secondaryObjectName}
            </strong>
            <StatusChip tone={alert.riskTier}>{alert.riskTier}</StatusChip>
          </div>
          <div style={{ color: "var(--muted)", marginTop: 8 }}>
            TCA {alert.tca} · miss distance {alert.missDistanceKm.toFixed(2)} km
          </div>
          {selectedAlertId === alert.id ? (
            <div style={{ color: "var(--muted)", marginTop: 8 }}>Selected for inspector focus.</div>
          ) : null}
        </button>
      ))}
    </div>
  );
}
