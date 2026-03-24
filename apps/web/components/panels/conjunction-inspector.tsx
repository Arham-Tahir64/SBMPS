import type { ConjunctionEventSummary } from "@sdmps/domain";
import { ShellSection, StatusChip } from "@sdmps/ui";

export function ConjunctionInspector({ conjunction }: { conjunction: ConjunctionEventSummary }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ShellSection title="Event">
        {conjunction.primaryObjectName} vs {conjunction.secondaryObjectName}
      </ShellSection>
      <ShellSection title="Risk">
        <StatusChip tone={conjunction.riskTier}>{conjunction.riskTier}</StatusChip>
      </ShellSection>
      <ShellSection title="Miss Distance">{conjunction.missDistanceKm.toFixed(2)} km</ShellSection>
      <ShellSection title="TCA">{conjunction.tca}</ShellSection>
    </div>
  );
}
