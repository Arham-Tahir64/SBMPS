import { Card } from "@sdmps/ui";

import { FeedsSettingsClient } from "./feeds-settings-client";

export const metadata = {
  title: "Feed Health | SDMPS",
  description: "Feed freshness and source status for SDMPS."
};

export default function FeedSettingsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="Feed Health" description="Source freshness, polling telemetry, and manual refresh">
        <FeedsSettingsClient />
      </Card>
    </main>
  );
}
