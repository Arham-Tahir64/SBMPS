import { Card } from "@sdmps/ui";
import { NewSimulationClient } from "./new-simulation-client";

export const metadata = {
  title: "New Simulation | SDMPS",
  description: "Queue a new simulation job."
};

export default function NewSimulationPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="New Simulation" description="Configure a forward-propagation conjunction scan">
        <NewSimulationClient />
      </Card>
    </main>
  );
}
