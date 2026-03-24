import Link from "next/link";

import { Card, ShellSection } from "@sdmps/ui";

export const metadata = {
  title: "Login | SDMPS",
  description: "Managed OIDC placeholder entrypoint for the SDMPS operator console."
};

export default function LoginPage() {
  return (
    <main style={{ display: "grid", minHeight: "100vh", placeItems: "center", padding: 24 }}>
      <Card title="Operator Sign-In" description="Managed OIDC placeholder">
        <ShellSection title="Status">
          Session bootstrapping is scaffolded. Connect this surface to Auth0 or WorkOS by wiring the
          OIDC adapter and callback handlers.
        </ShellSection>
        <Link
          href="/auth/mock-login"
          style={{
            display: "inline-flex",
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid rgba(83, 194, 255, 0.35)",
            marginTop: 12
          }}
        >
          Continue To Placeholder Console
        </Link>
      </Card>
    </main>
  );
}
