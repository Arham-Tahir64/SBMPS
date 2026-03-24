import type { ConjunctionEventSummary } from "@sdmps/domain";
import { ShellSection, StatusChip } from "@sdmps/ui";

export function ConjunctionInspector({
  conjunction,
  isFallback
}: {
  conjunction?: ConjunctionEventSummary;
  isFallback?: boolean;
}) {
  if (!conjunction) {
    return (
      <ShellSection title="Conjunction Inspector">
        Select a conjunction to inspect its miss distance and time of closest approach.
      </ShellSection>
    );
  }

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
      {isFallback ? <ShellSection title="Source">Showing fallback placeholder conjunction data.</ShellSection> : null}
    </div>
  );
}
