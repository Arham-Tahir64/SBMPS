import { sampleFeedStatus } from "@sdmps/api-client";
import { Card, ShellSection, StatusChip } from "@sdmps/ui";

export const metadata = {
  title: "Feed Health | SDMPS",
  description: "Feed freshness and source status for SDMPS."
};

export default function FeedSettingsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="Feed Health" description="Source freshness and polling visibility">
        {sampleFeedStatus.map((feed) => (
          <ShellSection key={feed.source} title={feed.source}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <span>Last ingest: {feed.lastIngestedAt}</span>
              <StatusChip tone={feed.isStale ? "high" : "low"}>
                {feed.isStale ? "STALE" : "HEALTHY"}
              </StatusChip>
            </div>
          </ShellSection>
        ))}
      </Card>
    </main>
  );
}
