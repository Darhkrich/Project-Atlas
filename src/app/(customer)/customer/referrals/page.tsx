import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { ReferralsContent } from "@/components/customer/referrals-content";

export default function ReferralsPage() {
  return (
    <>
      <CustomerPageHeader
        title="Referrals"
        description="Invite friends and earn rewards when they join Atlas."
      />
      <ReferralsContent />
    </>
  );
}