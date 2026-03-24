import type { ReactNode } from "react";

import "./globals.css";
import { AppNav } from "../components/layout/app-nav";
import { Providers } from "./providers";

export const metadata = {
  title: "SDMPS Operator Console",
  description: "Space Debris Mapping and Prediction System"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-shell">
            <AppNav />
            <main className="content">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
