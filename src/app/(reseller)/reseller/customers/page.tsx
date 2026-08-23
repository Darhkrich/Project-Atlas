import { ResellerCustomersList } from "@/components/reseller/reseller-customers";

export const metadata = {
  title: "Customers | Atlas Reseller",
  description:
    "Manage and view customers who purchase through your Atlas reseller storefront.",
};

export default function ResellerCustomersPage() {
  return <ResellerCustomersList />;
}