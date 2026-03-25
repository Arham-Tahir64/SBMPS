"use client";

import Link from "next/link";
import { StateNotice } from "@sdmps/ui";
import { useSimulations } from "../../lib/queries/use-simulations";

type StatusChipProps = { status: string };

function StatusChip({ status }: StatusChipProps) {
  const styles: Record<string, { bg: string; color: string }> = {
    queued:    { bg: "rgba(121,178,255,0.12)", color: "#79b2ff" },
    running:   { bg: "rgba(255,200,50,0.14)",  color: "#ffc832" },
    completed: { bg: "rgba(60,220,120,0.12)",  color: "#3cdc78" },
    failed:    { bg: "rgba(255,80,80,0.14)",   color: "#ff5050" },
  };
  const s = styles[status] ?? styles.queued;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: 6,
        background: s.bg,
        color: s.color,
      }}
    >
      {status}
    </span>
  );
}

function formatUtc(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export function SimulationsClient() {
  const { data, isLoading, isFallback, error } = useSimulations();

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          {data.length} job{data.length !== 1 ? "s" : ""}
          {isFallback ? " · fallback data" : " · api"}
          {isLoading ? " · refreshing" : ""}
        </span>
        <Link
          href="/simulations/new"
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "6px 16px",
            borderRadius: 8,
            background: "rgba(121,178,255,0.12)",
            border: "1px solid rgba(121,178,255,0.3)",
            color: "var(--accent)",
            textDecoration: "none",
          }}
        >
          + New Simulation
        </Link>
      </div>

      {error ? (
        <StateNotice title="Error" tone="warning">
          Could not load simulations from the API.
        </StateNotice>
      ) : null}

      {!isLoading && data.length === 0 ? (
        <StateNotice title="No Jobs" tone="info">
          No simulation jobs yet. Create one to get started.
        </StateNotice>
      ) : null}

      {/* Job cards */}
      {data.map((job) => (
        <div
          key={job.id}
          style={{
            border: "1px solid rgba(121,178,255,0.14)",
            borderRadius: 12,
            padding: "16px 20px",
            display: "grid",
            gap: 10,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {/* Top row: name + status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 15 }}>{job.scenarioName}</span>
            <StatusChip status={job.status} />
          </div>

          {/* Config row */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12, color: "var(--muted)" }}>
            <span>Duration: <strong style={{ color: "var(--foreground)" }}>{job.durationDays}d</strong></span>
            <span>Sample: <strong style={{ color: "var(--foreground)" }}>{job.objectSampleSize} objects</strong></span>
            <span>Step: <strong style={{ color: "var(--foreground)" }}>{job.stepHours}h</strong></span>
            <span>Created: <strong style={{ color: "var(--foreground)" }}>{formatUtc(job.createdAt)}</strong></span>
            {job.completedAt ? (
              <span>Completed: <strong style={{ color: "var(--foreground)" }}>{formatUtc(job.completedAt)}</strong></span>
            ) : null}
          </div>

          {/* Results row — only for completed jobs */}
          {job.status === "completed" && job.conjunctionsDetected != null ? (
            <div
              style={{
                display: "flex",
                gap: 16,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(60,220,120,0.05)",
                border: "1px solid rgba(60,220,120,0.12)",
                flexWrap: "wrap",
                fontSize: 12,
              }}
            >
              <span>Conjunctions detected: <strong style={{ color: "#3cdc78" }}>{job.conjunctionsDetected}</strong></span>
              <span>Critical: <strong style={{ color: "var(--risk-critical)" }}>{job.criticalCount ?? 0}</strong></span>
              <span>High: <strong style={{ color: "var(--risk-high)" }}>{job.highCount ?? 0}</strong></span>
              <span>Objects analyzed: <strong style={{ color: "var(--foreground)" }}>{job.objectsAnalyzed ?? "—"}</strong></span>
            </div>
          ) : null}

          {/* Error row */}
          {job.status === "failed" && job.errorMessage ? (
            <div
              style={{
                fontSize: 12,
                color: "#ff5050",
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(255,80,80,0.06)",
                border: "1px solid rgba(255,80,80,0.18)",
              }}
            >
              {job.errorMessage}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
