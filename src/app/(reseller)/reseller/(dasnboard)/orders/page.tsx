import { ResellerPageHeader } from "@/components/reseller/reseller-page-header";
import { ResellerOrdersList } from "@/components/reseller/reseller-orders-list";

export default function ResellerOrdersPage() {
  return (
    <>
      <ResellerPageHeader
        title="Orders"
        description="View and manage customer orders placed through your storefront."
      />
      <ResellerOrdersList />
    </>
  );
}