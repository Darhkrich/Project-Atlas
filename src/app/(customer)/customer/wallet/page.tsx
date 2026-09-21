import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { WalletOverview } from "@/components/customer/wallet/wallet-overview";

export default function WalletPage() {
  return (
    <>
      <CustomerPageHeader
        title="Wallet"
        description="Fund your Atlas wallet, buy services, and refund back to your original payment method."
        breadcrumbs={[
          { label: "Dashboard", href: "/customer/dashboard" },
          { label: "Wallet", current: true },
        ]}
      />
      <WalletOverview />
    </>
  );
}