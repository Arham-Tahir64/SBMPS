"use client";

import Link from "next/link";
import { Card, ShellSection, StateNotice, StatusChip } from "@sdmps/ui";

import { useConjunctions } from "../../../lib/queries/use-conjunctions";
import { useObjectDetail } from "../../../lib/queries/use-object-detail";

function formatVector(values: number[]): string {
  return values.map((v) => v.toFixed(3)).join(",  ");
}

function formatUtc(value: string): string {
  return new Date(value).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

const CLASS_LABEL: Record<string, string> = {
  "active-satellite": "Active Satellite",
  "rocket-body": "Rocket Body",
  "debris-fragment": "Debris Fragment"
};

export function ObjectDetailClient({ objectId }: { objectId: string }) {
  const { data: object, isLoading, isFallback, error } = useObjectDetail(objectId);
  const { data: allConjunctions } = useConjunctions();

  const relatedConjunctions = allConjunctions.filter(
    (c) => c.primaryObjectId === objectId || c.secondaryObjectId === objectId
  );

  if (isLoading && !object) {
    return (
      <main style={{ padding: 24 }}>
        <Card title="Loading…" description="Fetching object from API">
          <ShellSection title="Status">
            <span style={{ color: "var(--muted)" }}>Retrieving orbital state…</span>
          </ShellSection>
        </Card>
      </main>
    );
  }

  if (!object) {
    return (
      <main style={{ padding: 24 }}>
        <Card title="Not Found" description={`Object ${objectId}`}>
          <StateNotice title="Error" tone="warning">
            {error
              ? "Failed to load object detail from the API."
              : "No object with this ID exists in the current catalog."}
          </StateNotice>
          <div style={{ marginTop: 16 }}>
            <Link href="/objects" style={{ color: "var(--accent)", fontSize: 13 }}>
              ← Back to object catalog
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      {/* Header card */}
      <Card title={object.name} description={`NORAD ${object.noradId} · ${CLASS_LABEL[object.objectClass] ?? object.objectClass}`}>
        <div style={{ display: "grid", gap: 12 }}>
          {isFallback ? (
            <StateNotice title="Mode" tone="warning">
              Showing fallback data — API is unavailable or not yet configured.
            </StateNotice>
          ) : null}

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <StatusChip tone={object.riskTier}>{object.riskTier}</StatusChip>
            <span style={{ color: "var(--muted)", fontSize: 13 }}>
              Source: {object.source}
            </span>
            {object.operatorName ? (
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                Operator: {object.operatorName}
              </span>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Orbital state */}
      <Card title="Current Orbital State" description="Propagated via SGP4 at last worker cycle">
        <div style={{ display: "grid", gap: 10 }}>
          <ShellSection title="Epoch">
            <span style={{ fontFamily: "monospace" }}>{formatUtc(object.epoch)}</span>
          </ShellSection>

          <ShellSection title="ECI Position (km)">
            <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.8 }}>
              <div>X: {object.positionKm[0].toFixed(3)}</div>
              <div>Y: {object.positionKm[1].toFixed(3)}</div>
              <div>Z: {object.positionKm[2].toFixed(3)}</div>
            </div>
          </ShellSection>

          <ShellSection title="ECI Velocity (km/s)">
            <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.8 }}>
              <div>Vx: {object.velocityKmPerSecond[0].toFixed(6)}</div>
              <div>Vy: {object.velocityKmPerSecond[1].toFixed(6)}</div>
              <div>Vz: {object.velocityKmPerSecond[2].toFixed(6)}</div>
            </div>
          </ShellSection>

          <ShellSection title="Altitude (approx.)">
            <span style={{ fontFamily: "monospace" }}>
              {(Math.sqrt(
                object.positionKm[0] ** 2 +
                  object.positionKm[1] ** 2 +
                  object.positionKm[2] ** 2
              ) - 6371).toFixed(1)} km
            </span>
          </ShellSection>

          <ShellSection title="Speed (approx.)">
            <span style={{ fontFamily: "monospace" }}>
              {Math.sqrt(
                object.velocityKmPerSecond[0] ** 2 +
                  object.velocityKmPerSecond[1] ** 2 +
                  object.velocityKmPerSecond[2] ** 2
              ).toFixed(4)} km/s
            </span>
          </ShellSection>
        </div>
      </Card>

      {/* Related conjunctions */}
      <Card
        title="Related Conjunctions"
        description={
          relatedConjunctions.length > 0
            ? `${relatedConjunctions.length} active event${relatedConjunctions.length !== 1 ? "s" : ""} involving this object`
            : "No active conjunction events for this object"
        }
      >
        {relatedConjunctions.length === 0 ? (
          <StateNotice title="Clear" tone="neutral">
            This object has no recorded conjunction events in the current watchlist.
          </StateNotice>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {relatedConjunctions.map((c) => {
              const isSecondary = c.secondaryObjectId === objectId;
              const counterpartName = isSecondary ? c.primaryObjectName : c.secondaryObjectName;
              const counterpartId = isSecondary ? c.primaryObjectId : c.secondaryObjectId;

              return (
                <div
                  key={c.id}
                  style={{
                    border: "1px solid rgba(121, 178, 255, 0.14)",
                    borderRadius: 12,
                    padding: 12,
                    display: "grid",
                    gap: 6
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 13 }}>
                      vs.{" "}
                      <Link href={`/objects/${counterpartId}`} style={{ color: "var(--accent)" }}>
                        {counterpartName}
                      </Link>
                    </span>
                    <StatusChip tone={c.riskTier}>{c.riskTier}</StatusChip>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "monospace" }}>
                    Miss distance: {c.missDistanceKm.toFixed(3)} km · TCA: {formatUtc(c.tca)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div>
        <Link href="/objects" style={{ color: "var(--accent)", fontSize: 13 }}>
          ← Back to object catalog
        </Link>
      </div>
    </main>
  );
}
