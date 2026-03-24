"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Card } from "@sdmps/ui";

type OperatorShellProps = {
  title: string;
  subtitle: string;
  leftPanel: ReactNode;
  centerPanel: ReactNode;
  rightPanel: ReactNode;
  bottomPanel?: ReactNode;
};

export function OperatorShell({
  title,
  subtitle,
  leftPanel,
  centerPanel,
  rightPanel,
  bottomPanel
}: OperatorShellProps) {
  const [alertsCollapsed, setAlertsCollapsed] = useState(false);

  // Bottom strip height when expanded vs. collapsed
  const bottomStripHeight = alertsCollapsed ? 40 : 220;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: bottomPanel
          ? `36px 1fr ${bottomStripHeight}px`
          : "36px 1fr",
        height: "calc(100vh - var(--topbar-height))",
        gap: 0,
        overflow: "hidden"
      }}
    >
      {/* Slim title strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          borderBottom: "1px solid var(--panel-border)",
          background: "rgba(6, 17, 31, 0.6)"
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--text)"
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1
          }}
        >
          {subtitle}
        </span>
      </div>

      {/* Three-column main area */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px minmax(0, 1fr) 360px",
          gap: 12,
          padding: 12,
          overflow: "hidden",
          alignItems: "stretch"
        }}
      >
        {/* Left panel — filters */}
        <div style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Card title="Filters">{leftPanel}</Card>
        </div>

        {/* Center panel — globe, takes max height */}
        <div
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 0
          }}
        >
          <Card title="Orbital Picture">{centerPanel}</Card>
        </div>

        {/* Right panel — inspector, scrollable */}
        <div
          style={{
            overflow: "hidden",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Card title="Inspector">{rightPanel}</Card>
        </div>
      </div>

      {/* Bottom alert strip */}
      {bottomPanel ? (
        <div
          style={{
            borderTop: "1px solid var(--panel-border)",
            background: "rgba(4, 13, 26, 0.92)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transition: "height 0.2s ease"
          }}
        >
          {/* Strip header with collapse toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 16px",
              height: 40,
              flexShrink: 0,
              borderBottom: alertsCollapsed ? "none" : "1px solid var(--panel-border)",
              cursor: "pointer"
            }}
            onClick={() => setAlertsCollapsed((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-expanded={!alertsCollapsed}
            aria-label="Toggle alert stream"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setAlertsCollapsed((prev) => !prev);
              }
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--muted)"
              }}
            >
              Alert Stream
            </span>
            <span
              style={{
                fontSize: 14,
                color: "var(--muted)",
                transform: alertsCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
                lineHeight: 1,
                userSelect: "none"
              }}
            >
              &#8964;
            </span>
          </div>

          {/* Alert content */}
          {!alertsCollapsed ? (
            <div style={{ flex: 1, overflow: "hidden", overflowY: "auto", padding: "8px 12px" }}>
              {bottomPanel}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
