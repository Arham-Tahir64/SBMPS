import type { ConjunctionEventDetail, ConjunctionEventSummary } from "@sdmps/domain";
import { ShellSection, StatusChip } from "@sdmps/ui";

function hasConjunctionDetail(
  value: ConjunctionEventSummary | ConjunctionEventDetail
): value is ConjunctionEventDetail {
  return "relativeVelocityKmPerSecond" in value && "methodology" in value;
}

export function ConjunctionInspector({
  conjunction,
  detail,
  isLoading,
  isFallback
}: {
  conjunction?: ConjunctionEventSummary;
  detail?: ConjunctionEventDetail;
  isLoading?: boolean;
  isFallback?: boolean;
}) {
  const resolvedConjunction = detail ?? conjunction;

  if (isLoading && conjunction) {
    return (
      <ShellSection title="Conjunction Inspector">
        Loading richer conjunction detail for {conjunction.primaryObjectName} vs {conjunction.secondaryObjectName}.
      </ShellSection>
    );
  }

  if (!resolvedConjunction) {
    return (
      <ShellSection title="Conjunction Inspector">
        Select a conjunction to inspect its miss distance and time of closest approach.
      </ShellSection>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ShellSection title="Event">
        {resolvedConjunction.primaryObjectName} vs {resolvedConjunction.secondaryObjectName}
      </ShellSection>
      <ShellSection title="Risk">
        <StatusChip tone={resolvedConjunction.riskTier}>{resolvedConjunction.riskTier}</StatusChip>
      </ShellSection>
      <ShellSection title="Miss Distance">{resolvedConjunction.missDistanceKm.toFixed(2)} km</ShellSection>
      <ShellSection title="TCA">{resolvedConjunction.tca}</ShellSection>
      <ShellSection title="Relative Velocity">
        {hasConjunctionDetail(resolvedConjunction)
          ? `${resolvedConjunction.relativeVelocityKmPerSecond.toFixed(2)} km/s`
          : "Detail endpoint not yet loaded."}
      </ShellSection>
      {hasConjunctionDetail(resolvedConjunction) ? (
        <ShellSection title="Collision Probability">
          {resolvedConjunction.pcValue ? resolvedConjunction.pcValue.toExponential(2) : "Unavailable"}
        </ShellSection>
      ) : null}
      {hasConjunctionDetail(resolvedConjunction) ? (
        <ShellSection title="Methodology">{resolvedConjunction.methodology}</ShellSection>
      ) : null}
      {isFallback ? <ShellSection title="Mode">Showing fallback placeholder conjunction data.</ShellSection> : null}
    </div>
  );
}
