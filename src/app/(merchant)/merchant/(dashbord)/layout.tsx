import { MerchantLayout } from "@/components/merchant/merchant-layout";
import { CategoriesProvider } from "@/contexts/categories-context";

export default function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CategoriesProvider>
      <MerchantLayout>{children}</MerchantLayout>
    </CategoriesProvider>
  );
}