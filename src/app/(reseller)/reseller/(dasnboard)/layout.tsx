/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ResellerLayout } from "@/components/reseller/reseller-layout";
import { StorefrontProvider } from "@/contexts/storefront-context";
import { StorefrontCustomerProvider } from "@/contexts/storefront-customer-context";
import { ResellerStorefrontProvider } from "@/contexts/reseller-storefront-context";

export default function ResellerAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResellerLayout>
      <StorefrontProvider>
        <StorefrontCustomerProvider>
          <ResellerStorefrontProvider>
            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
              {children}
            </div>
          </ResellerStorefrontProvider>
        </StorefrontCustomerProvider>
      </StorefrontProvider>
    </ResellerLayout>
  );
}