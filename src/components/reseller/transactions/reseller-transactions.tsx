"use client";

import { useMemo, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { useCurrentReseller } from "@/lib/reseller/hooks/use-current-reseller";
import { useResellerTransactions } from "@/lib/reseller/hooks/use-reseller-transactions";
import { filterResellerTransactions } from "@/lib/reseller/wallet/transaction-projection";
import type { ResellerTransactionRow } from "@/lib/reseller/types/transaction";
import { formatCurrency } from "@/lib/shared/format";
import { TransactionFilters } from "./transaction-filters";
import { TransactionTable } from "./transaction-table";
import { TransactionDetailsModal } from "./transaction-details-modal";

export function ResellerTransactions() {
  const reseller = useCurrentReseller();
  const transactions = useResellerTransactions();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<ResellerTransactionRow | null>(null);

  const filtered = useMemo(
    () => filterResellerTransactions(transactions, activeFilter, searchQuery),
    [transactions, activeFilter, searchQuery]
  );

  const totalTransactions = transactions.length;
  const totalSpent = transactions
    .filter((t) => t.direction === "debit" && (t.kind === "wallet_purchase" || t.kind === "external_purchase"))
    .reduce((sum, t) => sum + t.amount, 0);
  const totalReceived = transactions
    .filter((t) => t.direction === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
          Financial activity
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
          Transactions
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
          Track wallet activity, purchases, commissions, refunds and funding
          transactions from one place.
        </p>
      </div>

      <div
        role="region"
        aria-label="Transaction summary"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <SummaryCard
          icon="receipt"
          label="Transactions"
          value={String(totalTransactions)}
          description="All recorded entries"
        />
        <SummaryCard
          icon="cart"
          label="Total Spent"
          value={formatCurrency(totalSpent)}
          description="Wallet and external purchases"
        />
        <SummaryCard
          icon="wallet"
          label="Money In"
          value={formatCurrency(totalReceived)}
          description="Funding and commissions"
        />
        <SummaryCard
          icon="check"
          label="Reseller"
          value={reseller?.name ?? "—"}
          description="Signed-in account"
        />
      </div>

      <AtlasCard padding="none">
        <div className="border-b border-neutral-200 p-5 dark:border-neutral-800">
          <TransactionFilters
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            onFilterChange={setActiveFilter}
            onSearchChange={setSearchQuery}
          />
        </div>

        {filtered.length > 0 ? (
          <TransactionTable
            transactions={filtered}
            onSelect={setSelectedTransaction}
          />
        ) : (
          <AtlasEmptyState
            title="No transactions found"
            description={
              searchQuery
                ? "Try changing your search or transaction filter."
                : "Your transaction activity will appear here."
            }
          />
        )}
      </AtlasCard>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: AtlasIconName;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <AtlasCard className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
            {value}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
          <AtlasIcon name={icon} className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </AtlasCard>
  );
}