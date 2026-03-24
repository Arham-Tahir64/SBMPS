import type { TrackedObjectSummary } from "@sdmps/domain";
import { ShellSection, StatusChip } from "@sdmps/ui";

export function ObjectInspector({
  object,
  isFallback
}: {
  object?: TrackedObjectSummary;
  isFallback?: boolean;
}) {
  if (!object) {
    return <ShellSection title="Object Inspector">Select an object to inspect its current orbital state.</ShellSection>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <ShellSection title={object.name}>
        <StatusChip tone={object.riskTier}>{object.riskTier}</StatusChip>
      </ShellSection>
      <ShellSection title="Object Class">{object.objectClass}</ShellSection>
      <ShellSection title="Epoch">{object.epoch}</ShellSection>
      <ShellSection title="Current ECI Position">{object.positionKm.join(", ")} km</ShellSection>
      {isFallback ? <ShellSection title="Source">Showing fallback placeholder object data.</ShellSection> : null}
    </div>
  );
}
