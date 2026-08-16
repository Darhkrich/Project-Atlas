import type { Metadata } from "next";
import { ThemeProvider } from "@/components/atlas/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas — Digital Services Made Simple",
  description: "Access airtime, data, electricity and other digital services through Atlas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}