import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { BeneficiariesList } from "@/components/customer/beneficiaries-list";

export default function BeneficiariesPage() {
  return (
    <>
      <CustomerPageHeader
        title="Beneficiaries"
        description="Manage your saved recipients for faster transactions."
      />
      <BeneficiariesList />
    </>
  );
}