/* eslint-disable react-hooks/immutability */
"use client";

import { useMemo, useState } from "react";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasIcon } from "@/components/atlas/icons";

import { useResellerData } from "@/contexts/reseller-data-context";
import type { Transaction } from "@/lib/transactions-data";

import { TransactionFilters } from "./transaction-filters";
import { TransactionTable } from "./transaction-table";
import { TransactionDetailsModal } from "./transaction-details-modal";

export function ResellerTransactions() {
  const { orders } = useResellerData();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Convert orders from context to Transaction objects
  const transactions = useMemo<Transaction[]>(() => {
    let balance = 0; // running balance for demonstration
    return orders.map((order) => {
      const amount = -parseFloat(order.amount.replace(/[^0-9.]/g, "") || "0");
      const balanceBefore = balance;
      const balanceAfter = balance + amount;
      balance = balanceAfter;

      return {
        id: order.id,
        reference: order.orderNumber,
        description: `${order.service} for ${order.customer}`,
        type: "Purchase",
        amount,
        date: order.date,
        status: order.status,
        service: order.service,
        customer: order.customer,
        paymentMethod: "Wallet",
        balanceBefore,
        balanceAfter,
      };
    });
  }, [orders]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const filterMatch =
        activeFilter === "all" || transaction.type === activeFilter;

      if (!filterMatch) return false;

      if (!query) return true;

      return [
        transaction.reference,
        transaction.description,
        transaction.type,
        transaction.service,
        transaction.customer,
        transaction.paymentMethod,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    });
  }, [transactions, activeFilter, searchQuery]);

  const totalTransactions = transactions.length;

  const totalSpent = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);

  const totalAdded = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((total, transaction) => total + transaction.amount, 0);

  const successfulTransactions = transactions.filter(
    (transaction) => transaction.status === "Successful",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon="receipt"
          label="Transactions"
          value={String(totalTransactions)}
          description="All recorded transactions"
        />

        <SummaryCard
          icon="receipt"
          label="Total Purchases"
          value={`GH₵${totalSpent.toFixed(2)}`}
          description="Wallet spending"
        />

        <SummaryCard
          icon="wallet"
          label="Money Added"
          value={`GH₵${totalAdded.toFixed(2)}`}
          description="Funding & commissions"
        />

        <SummaryCard
          icon="check"
          label="Successful"
          value={String(successfulTransactions)}
          description="Completed transactions"
        />
      </div>

      {/* Main */}
      <AtlasCard padding="none">
        <div className="border-b border-neutral-200 p-5 dark:border-neutral-800">
          <TransactionFilters
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            onFilterChange={setActiveFilter}
            onSearchChange={setSearchQuery}
          />
        </div>

        {filteredTransactions.length > 0 ? (
          <TransactionTable
            transactions={filteredTransactions}
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
  icon: Parameters<typeof AtlasIcon>[0]["name"];
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
          <AtlasIcon name={icon} className="h-5 w-5" />
        </div>
      </div>
    </AtlasCard>
  );
}