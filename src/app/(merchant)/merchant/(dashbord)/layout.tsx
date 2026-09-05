import { MerchantLayout } from "@/components/merchant/merchant-layout";

export default function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantLayout>{children}</MerchantLayout>;
}

