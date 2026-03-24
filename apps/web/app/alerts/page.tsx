import { Card } from "@sdmps/ui";

import { AlertsPageClient } from "./alerts-page-client";

export const metadata = {
  title: "Alerts | SDMPS",
  description: "Alert inbox for SDMPS operations."
};

export default function AlertsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="Alerts" description="Active conjunction, feed-stale, and simulation alerts">
        <AlertsPageClient />
      </Card>
    </main>
  );
}
