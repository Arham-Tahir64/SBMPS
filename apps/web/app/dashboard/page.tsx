import { DashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Dashboard | SDMPS",
  description: "Mission summary dashboard for SDMPS.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
