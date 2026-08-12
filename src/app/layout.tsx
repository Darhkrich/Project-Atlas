import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/providers";

export const metadata: Metadata = {
  title: "Atlas",
  description: "Modern development platform",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}