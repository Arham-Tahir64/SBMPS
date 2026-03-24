import { LiveOperationsClient } from "./live-operations-client";

export const metadata = {
  title: "Live Operations | SDMPS",
  description: "Real-time orbital operations console for tracked objects and conjunctions."
};

export default function OperationsLivePage() {
  return <LiveOperationsClient />;
}
