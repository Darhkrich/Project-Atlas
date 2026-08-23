import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { SupportContent } from "@/components/customer/support-content";

export default function CustomerSupportPage() {
  return (
    <>
      <CustomerPageHeader
        title="Support"
        description="Find help, troubleshoot issues, or contact the Atlas support team."
      />
      <SupportContent />
    </>
  );
}