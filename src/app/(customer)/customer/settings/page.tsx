import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { SettingsContent } from "@/components/customer/settings-content";

export default function SettingsPage() {
  return (
    <>
      <CustomerPageHeader
        title="Settings"
        description="Manage your account, security, and preferences."
      />
      <SettingsContent />
    </>
  );
}