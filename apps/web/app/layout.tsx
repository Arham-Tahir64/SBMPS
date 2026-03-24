import type { ReactNode } from "react";

import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "SDMPS Operator Console",
  description: "Space Debris Mapping and Prediction System"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
