import { sampleConjunctions } from "@sdmps/api-client";
import { Card, DataTablePlaceholder } from "@sdmps/ui";

export const metadata = {
  title: "Conjunctions | SDMPS",
  description: "Conjunction event list for SDMPS."
};

export default function ConjunctionsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="Conjunctions" description="Active and recent close-approach events">
        <DataTablePlaceholder
          columns={["Primary", "Secondary", "Miss Distance", "TCA", "Risk"]}
          rows={sampleConjunctions.map((item) => [
            item.primaryObjectName,
            item.secondaryObjectName,
            `${item.missDistanceKm.toFixed(2)} km`,
            item.tca,
            item.riskTier
          ])}
        />
      </Card>
    </main>
  );
}
