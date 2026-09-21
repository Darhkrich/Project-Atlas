import type { Metadata } from "next";
import { ThemeProvider } from "@/components/atlas/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { SavedPaymentMethodsProvider } from "@/contexts/SavedPaymentMethodsContext";
import { SavedDetailsProvider } from "@/contexts/SavedDetailsContext";
import "./globals.css";
import { StorefrontConfigProvider } from "@/contexts/storefront-config-context";
import { SubscriptionProvider } from "@/contexts/subscription-context";
import { OrdersProvider } from "@/contexts/orders-context";
import { StoreProductsProvider } from "@/contexts/store-products-context";
import { StoreCustomersProvider } from "@/contexts/store-customers-context";
import { AiAssistantProvider } from "@/contexts/ai-assistant-context";
import { ResellerStorefrontProvider } from "@/contexts/reseller-storefront-context";

export const metadata: Metadata = {
  title: "Atlas",
  description: "Digital services and ecommerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <AuthProvider>
          <ThemeProvider>
            <SavedPaymentMethodsProvider>
              <SavedDetailsProvider>
                <StorefrontConfigProvider>
                  <SubscriptionProvider>
                    <OrdersProvider>
                      <StoreProductsProvider>
                        <StoreCustomersProvider>
                          <AiAssistantProvider>
                            <ResellerStorefrontProvider>
                              {children}
                            </ResellerStorefrontProvider>
                          </AiAssistantProvider>
                        </StoreCustomersProvider>
                      </StoreProductsProvider>
                    </OrdersProvider>
                  </SubscriptionProvider>
                </StorefrontConfigProvider>
              </SavedDetailsProvider>
            </SavedPaymentMethodsProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}