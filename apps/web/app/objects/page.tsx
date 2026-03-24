import { sampleObjects } from "@sdmps/api-client";
import { Card, DataTablePlaceholder } from "@sdmps/ui";

export const metadata = {
  title: "Objects | SDMPS",
  description: "Tracked object catalog for SDMPS."
};

export default function ObjectsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="Tracked Objects" description="Catalog drill-down for active satellites and debris">
        <DataTablePlaceholder
          columns={["Name", "Class", "Risk", "Epoch"]}
          rows={sampleObjects.map((item) => [item.name, item.objectClass, item.riskTier, item.epoch])}
        />
      </Card>
    </main>
  );
}
