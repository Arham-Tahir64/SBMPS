"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import type { RiskTier } from "@sdmps/domain";

// ---------------------------------------------------------------------------
// Existing exports (unchanged)
// ---------------------------------------------------------------------------

export function Card({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
        borderRadius: 20,
        padding: 20,
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)"
      }}
    >
      <header style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{title}</h2>
        {description ? <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

export function ShellSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid rgba(121, 178, 255, 0.14)",
        borderRadius: 16,
        padding: 14,
        background: "rgba(255, 255, 255, 0.01)"
      }}
    >
      <div style={{ marginBottom: 8, color: "var(--muted)", fontSize: 12, letterSpacing: 1 }}>{title}</div>
      <div>{children}</div>
    </div>
  );
}

export function StateNotice({
  title,
  children,
  tone = "neutral"
}: {
  title: string;
  children: ReactNode;
  tone?: "neutral" | "info" | "warning";
}) {
  const toneStyles = {
    neutral: {
      border: "1px solid rgba(121, 178, 255, 0.14)",
      background: "rgba(255, 255, 255, 0.02)"
    },
    info: {
      border: "1px solid rgba(83, 194, 255, 0.22)",
      background: "rgba(83, 194, 255, 0.08)"
    },
    warning: {
      border: "1px solid rgba(255, 157, 66, 0.22)",
      background: "rgba(255, 157, 66, 0.08)"
    }
  } as const;

  return (
    <div
      style={{
        ...toneStyles[tone],
        borderRadius: 14,
        padding: 12
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 1, color: "var(--muted)", marginBottom: 6 }}>{title}</div>
      <div>{children}</div>
    </div>
  );
}

export function StatusChip({ tone, children }: { tone: RiskTier; children: ReactNode }) {
  const backgroundByTone: Record<RiskTier, string> = {
    low: "rgba(78, 212, 168, 0.16)",
    medium: "rgba(247, 209, 84, 0.16)",
    high: "rgba(255, 157, 66, 0.16)",
    critical: "rgba(255, 77, 77, 0.16)"
  };

  return (
    <span
      style={{
        display: "inline-flex",
        borderRadius: 999,
        padding: "6px 10px",
        background: backgroundByTone[tone],
        border: "1px solid rgba(255, 255, 255, 0.08)",
        textTransform: "uppercase",
        fontSize: 12
      }}
    >
      {children}
    </span>
  );
}

export function DataTablePlaceholder({
  columns,
  rows,
  rowIds,
  selectedRowId,
  onRowClick,
  caption,
  emptyMessage,
  isLoading,
  loadingMessage
}: {
  columns: string[];
  rows: Array<Array<string>>;
  rowIds?: string[];
  selectedRowId?: string;
  onRowClick?: (rowId: string) => void;
  caption?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingMessage?: string;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      {caption ? <div style={{ color: "var(--muted)", marginBottom: 12 }}>{caption}</div> : null}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                style={{ textAlign: "left", padding: "10px 12px", color: "var(--muted)", fontWeight: 500 }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: "16px 12px",
                  borderTop: "1px solid rgba(121, 178, 255, 0.14)",
                  color: "var(--muted)"
                }}
              >
                {isLoading ? loadingMessage ?? "Loading records..." : emptyMessage ?? "No records available."}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => {
              const rowId = rowIds?.[index];
              const isInteractive = Boolean(rowId && onRowClick);
              const isSelected = rowId === selectedRowId;
              const handleSelect = () => {
                if (rowId) {
                  onRowClick?.(rowId);
                }
              };

              return (
                <tr
                  key={rowId ?? row.join("::")}
                  onClick={isInteractive ? handleSelect : undefined}
                  onKeyDown={
                    isInteractive
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleSelect();
                          }
                        }
                      : undefined
                  }
                  tabIndex={isInteractive ? 0 : -1}
                  aria-selected={isSelected}
                  style={{
                    background: isSelected ? "rgba(83, 194, 255, 0.08)" : "transparent",
                    cursor: isInteractive ? "pointer" : "default",
                    outline: "none"
                  }}
                >
                  {row.map((value, cellIndex) => (
                    <td
                      key={`${value}-${cellIndex}`}
                      style={{
                        padding: "12px",
                        borderTop: "1px solid rgba(121, 178, 255, 0.14)"
                      }}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// New exports
// ---------------------------------------------------------------------------

/**
 * NavItem — a navigation link with an icon slot, label, and active state.
 * Designed for sidebar or horizontal nav bars.
 */
export function NavItem({
  href,
  label,
  icon,
  isActive = false
}: {
  href: string;
  label: string;
  icon?: ReactNode;
  isActive?: boolean;
}) {
  return (
    <a
      href={href}
      aria-current={isActive ? "page" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 14px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: isActive ? 600 : 400,
        letterSpacing: "0.02em",
        color: isActive ? "var(--accent)" : "var(--muted)",
        background: isActive ? "rgba(83, 194, 255, 0.1)" : "transparent",
        borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
        textDecoration: "none",
        transition: "background 0.15s, color 0.15s"
      }}
    >
      {icon ? (
        <span style={{ display: "flex", flexShrink: 0, opacity: isActive ? 1 : 0.65 }}>
          {icon}
        </span>
      ) : null}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
    </a>
  );
}

/**
 * MissionClock — displays the current UTC date and time, updating every second.
 * Self-contained client component; safe to render anywhere in the tree.
 */
export function MissionClock() {
  const [utcTime, setUtcTime] = useState<string>(() => new Date().toISOString());

  useEffect(() => {
    const id = setInterval(() => {
      setUtcTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const [datePart, timeFull] = utcTime.split("T");
  const timePart = timeFull?.slice(0, 8) ?? "--:--:--";

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-end",
        lineHeight: 1.2
      }}
    >
      <span
        style={{
          fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: "var(--accent)"
        }}
      >
        {timePart}
        <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>UTC</span>
      </span>
      <span style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.06em" }}>
        {datePart}
      </span>
    </div>
  );
}

/**
 * RiskBadge — colored dot + label reflecting the PRD risk tier color system
 * (REQ-VIS-02). Replaces or complements StatusChip with a more visual treatment.
 *
 * Low      → green  (#4ed4a8 / --risk-low)
 * Medium   → yellow (#f7d154 / --risk-medium)
 * High     → orange (#ff9d42 / --risk-high)
 * Critical → red    (#ff4d4d / --risk-critical)
 */
export function RiskBadge({ tier, label }: { tier: RiskTier; label?: string }) {
  const colorByTier: Record<RiskTier, string> = {
    low: "var(--risk-low, #4ed4a8)",
    medium: "var(--risk-medium, #f7d154)",
    high: "var(--risk-high, #ff9d42)",
    critical: "var(--risk-critical, #ff4d4d)"
  };

  const backgroundByTier: Record<RiskTier, string> = {
    low: "rgba(78, 212, 168, 0.12)",
    medium: "rgba(247, 209, 84, 0.12)",
    high: "rgba(255, 157, 66, 0.12)",
    critical: "rgba(255, 77, 77, 0.12)"
  };

  const defaultLabel: Record<RiskTier, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical"
  };

  const color = colorByTier[tier];
  const displayLabel = label ?? defaultLabel[tier];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: backgroundByTier[tier],
        border: `1px solid ${color}44`,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color
      }}
    >
      {/* Colored dot */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 5px ${color}`,
          flexShrink: 0
        }}
      />
      {displayLabel}
    </span>
  );
}

/**
 * MetricTile — compact stat display: label + large number + optional trend.
 * Suitable for dashboard header rows or summary strips.
 *
 * trend: "up" | "down" | "neutral" — adds a directional indicator beside the value.
 */
export function MetricTile({
  label,
  value,
  trend,
  unit
}: {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  unit?: string;
}) {
  const trendColor = trend === "up" ? "var(--danger)" : trend === "down" ? "var(--success)" : "var(--muted)";
  const trendSymbol = trend === "up" ? "\u2191" : trend === "down" ? "\u2193" : "\u2014";

  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
        borderRadius: 14,
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minWidth: 110
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--muted)"
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontFamily: '"SF Mono", "Fira Code", monospace',
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1,
            color: "var(--text)"
          }}
        >
          {value}
        </span>
        {unit ? (
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{unit}</span>
        ) : null}
        {trend ? (
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: trendColor,
              lineHeight: 1,
              marginLeft: 2
            }}
            aria-label={trend === "up" ? "trending up" : trend === "down" ? "trending down" : "no change"}
          >
            {trendSymbol}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * SectionDivider — thin horizontal rule with an optional centered text label.
 * Uses var(--panel-border) so it blends with the panel aesthetic.
 */
export function SectionDivider({ label }: { label?: string }) {
  if (!label) {
    return (
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--panel-border)",
          margin: "12px 0"
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "12px 0"
      }}
    >
      <div style={{ flex: 1, height: 1, background: "var(--panel-border)" }} />
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--muted)",
          flexShrink: 0
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--panel-border)" }} />
    </div>
  );
}
