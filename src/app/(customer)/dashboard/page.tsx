import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { DashboardOverview } from "@/components/customer/dashboard-overview";

export default function DashboardPage() {
  return (
    <>
      <CustomerPageHeader
        title="Dashboard"
        description="Here's an overview of your Atlas account."
      />

      <DashboardOverview />
    </>
  );
}