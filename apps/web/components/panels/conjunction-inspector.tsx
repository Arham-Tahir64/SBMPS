import type { ConjunctionEventDetail, ConjunctionEventSummary } from "@sdmps/domain";
import { ShellSection, StateNotice, StatusChip } from "@sdmps/ui";

function hasConjunctionDetail(
  value: ConjunctionEventSummary | ConjunctionEventDetail
): value is ConjunctionEventDetail {
  return "relativeVelocityKmPerSecond" in value && "methodology" in value;
}

export function ConjunctionInspector({
  conjunction,
  detail,
  isLoading,
  isFallback,
  hasDetailError
}: {
  conjunction?: ConjunctionEventSummary;
  detail?: ConjunctionEventDetail;
  isLoading?: boolean;
  isFallback?: boolean;
  hasDetailError?: boolean;
}) {
  const resolvedConjunction = detail ?? conjunction;

  if (!resolvedConjunction) {
    return (
      <ShellSection title="Conjunction Inspector">
        No persisted conjunction watchlist exists yet.
      </ShellSection>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {isLoading && conjunction ? (
        <StateNotice title="Detail Status" tone="info">
          Loading richer conjunction detail for {conjunction.primaryObjectName} vs {conjunction.secondaryObjectName}
          while keeping the current summary visible.
        </StateNotice>
      ) : null}
      {hasDetailError ? (
        <StateNotice title="Detail Status" tone="warning">
          The richer conjunction detail request failed. The inspector is showing the latest summary instead.
        </StateNotice>
      ) : null}
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
          : "Persisted detail is still loading. The current summary remains visible."}
      </ShellSection>
      {hasConjunctionDetail(resolvedConjunction) ? (
        <ShellSection title="Collision Probability">
          {resolvedConjunction.pcValue ? resolvedConjunction.pcValue.toExponential(2) : "Unavailable"}
        </ShellSection>
      ) : null}
      {hasConjunctionDetail(resolvedConjunction) ? (
        <ShellSection title="Methodology">{resolvedConjunction.methodology}</ShellSection>
      ) : null}
      {isFallback ? (
        <StateNotice title="Mode" tone="warning">
          Showing fallback placeholder conjunction data.
        </StateNotice>
      ) : null}
    </div>
  );
}
