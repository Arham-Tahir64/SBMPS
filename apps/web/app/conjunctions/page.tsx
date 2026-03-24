import { Card } from "@sdmps/ui";
import { ConjunctionsPageClient } from "./conjunctions-page-client";

export const metadata = {
  title: "Conjunctions | SDMPS",
  description: "Conjunction event list for SDMPS."
};

export default function ConjunctionsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="Conjunctions" description="Active and recent close-approach events">
        <ConjunctionsPageClient />
      </Card>
    </main>
  );
}
