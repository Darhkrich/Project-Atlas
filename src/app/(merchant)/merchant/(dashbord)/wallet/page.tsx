/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";
import { fundMethods, withdrawMethods } from "@/lib/payment-methods";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { cn } from "@/lib/utils";

function parseTotal(total: string | number): number {
  if (typeof total === "number") return total;
  const numericString = total.replace(/[^0-9.]/g, "");
  return parseFloat(numericString) || 0;
}

export default function MerchantWalletPage() {
  const { storefrontConfig } = useStorefrontConfig();
  const { orders: realOrders } = useOrders();
  const storeSlug = storefrontConfig.slug;

  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const computedBalance = useMemo(() => {
    const storeOrders = realOrders.filter((order) => order.storeSlug === storeSlug);
    const revenue = storeOrders.reduce(
      (sum, order) => sum + (order.paymentStatus === "Paid" ? order.total : 0),
      0
    );
    const openingBalance = 500;
    return openingBalance + revenue;
  }, [realOrders, storeSlug]);

  const recentTransactions = useMemo(() => {
    return realOrders
      .filter((order) => order.storeSlug === storeSlug)
      .map((order) => ({
        id: `tx-${order.id}`,
        description: `Order payment ${order.orderNumber}`,
        date: order.date,
        amount: order.total,
        type: "credit" as const,
        method: order.paymentMethod || "Mobile Money",
        icon: "cart" as const,
        timestamp: order.createdAt || Date.now(),
      }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [realOrders, storeSlug]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Wallet
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Manage your funds, withdrawals, and transaction history.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-brand-50 via-white to-accent-50 p-6 dark:from-brand-900/30 dark:via-neutral-900 dark:to-accent-900/20 dark:border-neutral-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-neutral-500">Available Balance</p>
            <p className="mt-1 text-4xl font-bold text-neutral-900 dark:text-neutral-100">
              GH₵ {computedBalance.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-neutral-500">Updated from store orders</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setFundModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
            >
              <AtlasIcon name="plus" className="h-5 w-5" />
              Fund Wallet
            </button>
            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <AtlasIcon name="arrow-up" className="h-5 w-5" />
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Transaction History
          </h2>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {recentTransactions.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-500">
              No transactions yet.
            </p>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <AtlasIcon name={tx.icon} className="h-5 w-5 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {tx.description}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {tx.date} · {tx.method}
                    </p>
                  </div>
                </div>
                <span className={cn("text-sm font-semibold", tx.type === "credit" ? "text-success-600" : "text-neutral-900 dark:text-neutral-100")}>
                  {tx.type === "credit" ? "+" : ""}GH₵ {tx.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <PaymentFlowModal
        open={fundModalOpen}
        mode="fund"
        title="Fund Wallet"
        methods={fundMethods}
        showAmountInput
        onClose={() => setFundModalOpen(false)}
        onSuccess={() => {}}
        onFailed={() => {}}
      />
      <PaymentFlowModal
        open={withdrawModalOpen}
        mode="withdraw"
        title="Withdraw Funds"
        methods={withdrawMethods}
        showAmountInput
        onClose={() => setWithdrawModalOpen(false)}
        onSuccess={() => {}}
        onFailed={() => {}}
      />
    </div>
  );
}