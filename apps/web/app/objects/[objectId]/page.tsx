import { sampleObjects } from "@sdmps/api-client";
import { Card, ShellSection, StatusChip } from "@sdmps/ui";

export const metadata = {
  title: "Object Detail | SDMPS",
  description: "Tracked object detail view for SDMPS."
};

export default function ObjectDetailPage({ params }: { params: { objectId: string } }) {
  const object = sampleObjects.find((item) => item.id === params.objectId) ?? sampleObjects[0];

  return (
    <main style={{ padding: 24 }}>
      <Card title={object.name} description="Object detail placeholder">
        <ShellSection title="Risk">
          <StatusChip tone={object.riskTier}>{object.riskTier}</StatusChip>
        </ShellSection>
        <ShellSection title="Current State">
          ECI Position: {object.positionKm.join(", ")} km
        </ShellSection>
        <ShellSection title="Roadmap">
          This route will host orbital parameters, risk history, related conjunctions, and trajectory
          visualizations.
        </ShellSection>
      </Card>
    </main>
  );
}
