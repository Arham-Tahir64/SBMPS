import type { ConjunctionEventSummary } from "@sdmps/domain";
import { ShellSection, StatusChip } from "@sdmps/ui";

export function AlertInbox({ alerts }: { alerts: ConjunctionEventSummary[] }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
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
