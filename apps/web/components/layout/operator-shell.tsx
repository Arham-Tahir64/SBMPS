import type { ReactNode } from "react";

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
  return (
    <main style={{ display: "grid", minHeight: "100vh", gap: 16, padding: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 30 }}>{title}</h1>
        <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>{subtitle}</p>
      </header>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "280px minmax(0, 1fr) 360px",
          gap: 16,
          alignItems: "stretch"
        }}
      >
        <Card title="Filters">{leftPanel}</Card>
        <Card title="Orbital Picture">{centerPanel}</Card>
        <Card title="Inspector">{rightPanel}</Card>
      </section>
      {bottomPanel ? <Card title="Alert Stream">{bottomPanel}</Card> : null}
    </main>
  );
}
