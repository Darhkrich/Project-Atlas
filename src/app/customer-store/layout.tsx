import { StorefrontCustomerProvider } from "@/contexts/storefront-customer-context";
import { ResellerDataProvider } from "@/contexts/reseller-data-context";

export default function CustomerStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResellerDataProvider>
      <StorefrontCustomerProvider>
        {children}
      </StorefrontCustomerProvider>
    </ResellerDataProvider>
  );
}