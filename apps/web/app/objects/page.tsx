import { Card } from "@sdmps/ui";
import { ObjectsPageClient } from "./objects-page-client";

export const metadata = {
  title: "Objects | SDMPS",
  description: "Tracked object catalog for SDMPS."
};

export default function ObjectsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="Tracked Objects" description="Catalog drill-down for active satellites and debris">
        <ObjectsPageClient />
      </Card>
    </main>
  );
}
