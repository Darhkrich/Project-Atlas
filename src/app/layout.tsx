import type { Metadata } from "next";
import { ThemeProvider } from "@/components/atlas/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SavedPaymentMethodsProvider } from "@/contexts/SavedPaymentMethodsContext";
import { SavedDetailsProvider } from "@/contexts/SavedDetailsContext";
import "./globals.css";
import { ResellerProvider } from "@/contexts/ResellerContext";

export const metadata: Metadata = {
  title: "Atlas — Digital Services Made Simple",
  description:
    "Access airtime, data, electricity and other digital services through Atlas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <ThemeProvider>
          <AuthProvider>
<SavedPaymentMethodsProvider>
  <SavedDetailsProvider>
    <ResellerProvider>{children}</ResellerProvider>
  </SavedDetailsProvider>
</SavedPaymentMethodsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



