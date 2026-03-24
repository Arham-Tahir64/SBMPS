import type { TrackedObjectDetail, TrackedObjectSummary } from "@sdmps/domain";
import { ShellSection, StateNotice, StatusChip } from "@sdmps/ui";

function formatVector(values: [number, number, number] | number[]): string {
  return values.map((value) => value.toFixed(2)).join(", ");
}

function hasObjectDetail(
  value: TrackedObjectSummary | TrackedObjectDetail
): value is TrackedObjectDetail {
  return "velocityKmPerSecond" in value && "source" in value;
}

export function ObjectInspector({
  object,
  detail,
  isLoading,
  isFallback,
  hasDetailError
}: {
  object?: TrackedObjectSummary;
  detail?: TrackedObjectDetail;
  isLoading?: boolean;
  isFallback?: boolean;
  hasDetailError?: boolean;
}) {
  const resolvedObject = detail ?? object;

  if (!resolvedObject) {
    return <ShellSection title="Object Inspector">Select an object to inspect its current orbital state.</ShellSection>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {isLoading && object ? (
        <StateNotice title="Detail Status" tone="info">
          Loading richer object detail for <strong>{object.name}</strong> while keeping the current summary visible.
        </StateNotice>
      ) : null}
      {hasDetailError ? (
        <StateNotice title="Detail Status" tone="warning">
          The richer object detail request failed. The inspector is showing the latest summary state instead.
        </StateNotice>
      ) : null}
      <ShellSection title={resolvedObject.name}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <StatusChip tone={resolvedObject.riskTier}>{resolvedObject.riskTier}</StatusChip>
          <span style={{ color: "var(--muted)" }}>NORAD {resolvedObject.noradId}</span>
        </div>
      </ShellSection>
      <ShellSection title="Object Class">{resolvedObject.objectClass}</ShellSection>
      <ShellSection title="Epoch">{resolvedObject.epoch}</ShellSection>
      <ShellSection title="Current ECI Position">{formatVector(resolvedObject.positionKm)} km</ShellSection>
      <ShellSection title="Velocity">
        {hasObjectDetail(resolvedObject)
          ? `${formatVector(resolvedObject.velocityKmPerSecond)} km/s`
          : "Detail endpoint not yet loaded."}
      </ShellSection>
      <ShellSection title="Source">{hasObjectDetail(resolvedObject) ? resolvedObject.source : "Live snapshot summary"}</ShellSection>
      {hasObjectDetail(resolvedObject) ? (
        <ShellSection title="Operator">{resolvedObject.operatorName ?? "Unassigned / unknown"}</ShellSection>
      ) : null}
      {isFallback ? (
        <StateNotice title="Mode" tone="warning">
          Showing fallback placeholder object data.
        </StateNotice>
      ) : null}
    </div>
  );
}
