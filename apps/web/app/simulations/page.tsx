import { Card, ShellSection } from "@sdmps/ui";
import { isSimulationsEnabled } from "../../lib/features";

export const metadata = {
  title: "Simulations | SDMPS",
  description: "Simulation workspace placeholder for SDMPS."
};

export default function SimulationsPage() {
  const enabled = isSimulationsEnabled();

  return (
    <main style={{ padding: 24 }}>
      <Card title="Simulations" description="Feature-flagged v1.5 workspace">
        <ShellSection title="Status">
          {enabled
            ? "Simulation creation and result exploration will hydrate from the API once the backend feature lands."
            : "Simulation routes are currently disabled by NEXT_PUBLIC_FEATURE_SIMULATIONS."}
        </ShellSection>
      </Card>
    </main>
  );
}
