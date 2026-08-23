import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { WalletOverview } from "@/components/customer/wallet-overview";

export default function WalletPage() {
  return (
    <>
      <CustomerPageHeader
        title="Wallet"
        description="Manage your Atlas wallet, fund your account, and track your balance."
      />
      <WalletOverview />
    </>
  );
}