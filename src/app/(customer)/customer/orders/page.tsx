import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { OrdersList } from "@/components/customer/orders-list";

export default function OrdersPage() {
  return (
    <>
      <CustomerPageHeader
        title="Orders"
        description="Track your service orders and delivery status."
      />
      <OrdersList />
    </> 
  );
}