import { Card, ShellSection } from "@sdmps/ui";

export const metadata = {
  title: "New Simulation | SDMPS",
  description: "Simulation scenario builder placeholder for SDMPS."
};

export default function NewSimulationPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="New Simulation" description="Scenario builder placeholder">
        <ShellSection title="Feature Gate">
          This route is intentionally scaffolded ahead of v1.5 implementation so the information
          architecture is stable.
        </ShellSection>
      </Card>
    </main>
  );
}
