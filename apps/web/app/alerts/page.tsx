import { sampleConjunctions } from "@sdmps/api-client";
import { AlertInbox } from "../../components/alerts/alert-inbox";

export const metadata = {
  title: "Alerts | SDMPS",
  description: "Alert inbox for SDMPS operations."
};

export default function AlertsPage() {
  return (
    <main style={{ padding: 24 }}>
      <AlertInbox alerts={sampleConjunctions} />
    </main>
  );
}
