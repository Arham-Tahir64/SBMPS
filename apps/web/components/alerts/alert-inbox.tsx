import type { ConjunctionEventSummary } from "@sdmps/domain";
import { ShellSection, StatusChip } from "@sdmps/ui";

export function AlertInbox({
  alerts,
  isFallback
}: {
  alerts: ConjunctionEventSummary[];
  isFallback?: boolean;
}) {
  if (alerts.length === 0) {
    return <ShellSection title="Alerts">No active conjunction alerts.</ShellSection>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {isFallback ? <ShellSection title="Mode">Showing fallback alert data because the API is unavailable.</ShellSection> : null}
      {alerts.map((alert) => (
        <ShellSection key={alert.id} title={`${alert.primaryObjectName} / ${alert.secondaryObjectName}`}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span>TCA {alert.tca}</span>
            <StatusChip tone={alert.riskTier}>{alert.riskTier}</StatusChip>
          </div>
        </ShellSection>
      ))}
    </div>
  );
}
