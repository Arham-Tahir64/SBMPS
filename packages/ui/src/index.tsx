import type { ReactNode } from "react";

import type { RiskTier } from "@sdmps/domain";

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
  caption
}: {
  columns: string[];
  rows: Array<Array<string>>;
  rowIds?: string[];
  selectedRowId?: string;
  onRowClick?: (rowId: string) => void;
  caption?: string;
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
          {rows.map((row, index) => (
            <tr
              key={rowIds?.[index] ?? row.join("::")}
              onClick={rowIds?.[index] && onRowClick ? () => onRowClick(rowIds[index]) : undefined}
              style={{
                background: rowIds?.[index] === selectedRowId ? "rgba(83, 194, 255, 0.08)" : "transparent",
                cursor: rowIds?.[index] && onRowClick ? "pointer" : "default"
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
