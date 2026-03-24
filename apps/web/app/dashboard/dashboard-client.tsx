"use client";

import Link from "next/link";
import { Card, StateNotice } from "@sdmps/ui";
import { useDashboard } from "../../lib/queries/use-dashboard";

function formatUtc(value: string): string {
  return new Date(value).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

type MetricTileProps = {
  label: string;
  value: number | string;
  tone?: "neutral" | "warning" | "critical" | "ok";
  href?: string;
};

function MetricTile({ label, value, tone = "neutral", href }: MetricTileProps) {
  const borderColor =
    tone === "critical"
      ? "var(--risk-critical)"
      : tone === "warning"
      ? "var(--risk-high)"
      : tone === "ok"
      ? "var(--risk-low)"
      : "rgba(121, 178, 255, 0.14)";

  const valueColor =
    tone === "critical"
      ? "var(--risk-critical)"
      : tone === "warning"
      ? "var(--risk-high)"
      : tone === "ok"
      ? "var(--risk-low)"
      : "var(--foreground)";

  const content = (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: "rgba(255,255,255,0.02)",
        cursor: href ? "pointer" : "default",
        transition: "background 0.15s",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <span style={{ fontSize: 36, fontWeight: 700, fontFamily: "monospace", color: valueColor, lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }
  return content;
}

export function DashboardClient() {
  const { data, isLoading, isFallback } = useDashboard();

  if (isLoading && !data) {
    return (
      <main style={{ padding: 24 }}>
        <Card title="Loading…" description="Fetching mission summary">
          <span style={{ color: "var(--muted)" }}>Contacting API…</span>
        </Card>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ padding: 24 }}>
        <Card title="Dashboard" description="Mission summary unavailable">
          <StateNotice title="Error" tone="warning">
            Could not load dashboard summary from the API.
          </StateNotice>
        </Card>
      </main>
    );
  }

  const criticalTone = data.criticalRiskConjunctionCount > 0 ? "critical" : "neutral";
  const highTone = data.highRiskConjunctionCount > 0 ? "warning" : "neutral";
  const feedTone = data.staleFeedCount > 0 ? "warning" : "ok";

  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      <Card
        title="Mission Dashboard"
        description={`Epoch: ${formatUtc(data.epoch)}`}
      >
        {isFallback ? (
          <StateNotice title="Mode" tone="warning">
            Showing fallback data — API is unavailable or not yet configured.
          </StateNotice>
        ) : null}
      </Card>

      {/* Metric grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <MetricTile
          label="Tracked Objects"
          value={data.trackedObjectCount}
          tone="neutral"
          href="/objects"
        />
        <MetricTile
          label="Critical Conjunctions"
          value={data.criticalRiskConjunctionCount}
          tone={criticalTone}
          href="/conjunctions"
        />
        <MetricTile
          label="High-Risk Conjunctions"
          value={data.highRiskConjunctionCount}
          tone={highTone}
          href="/conjunctions"
        />
        <MetricTile
          label="Active Feeds"
          value={data.activeFeedCount}
          tone="ok"
          href="/settings/feeds"
        />
        <MetricTile
          label="Stale Feeds"
          value={data.staleFeedCount}
          tone={feedTone}
          href="/settings/feeds"
        />
      </div>

      {/* Quick links */}
      <Card title="Quick Access" description="Navigate to key operator views">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Live Operations", href: "/operations/live" },
            { label: "Conjunctions", href: "/conjunctions" },
            { label: "Object Catalog", href: "/objects" },
            { label: "Alerts", href: "/alerts" },
            { label: "Feed Settings", href: "/settings/feeds" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                color: "var(--accent)",
                fontSize: 13,
                padding: "6px 14px",
                border: "1px solid rgba(121, 178, 255, 0.25)",
                borderRadius: 8,
                textDecoration: "none",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </Card>
    </main>
  );
}
