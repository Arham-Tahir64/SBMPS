import { Card, ShellSection } from "@sdmps/ui";

export const metadata = {
  title: "Simulations | SDMPS",
  description: "Simulation workspace placeholder for SDMPS."
};

export default function SimulationsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="Simulations" description="Feature-flagged v1.5 workspace">
        <ShellSection title="Status">
          Simulation creation and result exploration are scaffolded in routing only. Enable when backend
          simulation jobs land.
        </ShellSection>
      </Card>
    </main>
  );
}
