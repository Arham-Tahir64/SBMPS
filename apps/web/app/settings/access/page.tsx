import { Card, ShellSection } from "@sdmps/ui";

export const metadata = {
  title: "Access Control | SDMPS",
  description: "Access control and RBAC settings placeholder for SDMPS."
};

export default function AccessSettingsPage() {
  return (
    <main style={{ padding: 24 }}>
      <Card title="Access Control" description="RBAC and session posture placeholder">
        <ShellSection title="Roles">Viewer, Analyst, Operator, and Admin roles are scaffolded.</ShellSection>
        <ShellSection title="Provider">Connect managed OIDC settings through infra env files and API auth adapters.</ShellSection>
      </Card>
    </main>
  );
}
