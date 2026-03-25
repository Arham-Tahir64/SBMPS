import { Card } from "@sdmps/ui";
import { SimulationsClient } from "./simulations-client";

export const metadata = {
  title: "Simulations | SDMPS",
  description: "Simulation workspace for SDMPS."
};

export default function SimulationsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="Simulations" description="Run forward-propagation conjunction scans over a sampled object catalog">
        <SimulationsClient />
      </Card>
    </main>
  );
}
