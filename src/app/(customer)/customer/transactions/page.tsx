import { CustomerPageHeader } from "@/components/customer/customer-page-header";
import { TransactionsList } from "@/components/customer/transactions-list";

export default function TransactionsPage() {
  return (
    <>
      <CustomerPageHeader
        title="Transactions"
        description="View all your transaction history."
      />
      <TransactionsList />
    </>
  );
}