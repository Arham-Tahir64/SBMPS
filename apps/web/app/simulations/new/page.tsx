import { Card, ShellSection } from "@sdmps/ui";
import { isSimulationsEnabled } from "../../../lib/features";

export const metadata = {
  title: "New Simulation | SDMPS",
  description: "Simulation scenario builder placeholder for SDMPS."
};

export default function NewSimulationPage() {
  const enabled = isSimulationsEnabled();

  return (
    <main style={{ padding: 24 }}>
      <Card title="New Simulation" description="Scenario builder placeholder">
        <ShellSection title="Feature Gate">
          {enabled
            ? "This route is ready to host the scenario builder once backend simulation jobs are exposed."
            : "This route is intentionally mounted but disabled until NEXT_PUBLIC_FEATURE_SIMULATIONS is enabled."}
        </ShellSection>
      </Card>
    </main>
  );
}
