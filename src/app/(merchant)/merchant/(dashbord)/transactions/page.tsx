"use client";

import { useMemo } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useOrders } from "@/contexts/orders-context";
import { cn } from "@/lib/utils";

export default function MerchantTransactionsPage() {
  const { storefrontConfig } = useStorefrontConfig();
  const { getOrdersForStore } = useOrders();
  const storeSlug = storefrontConfig.slug || "my-store";

  const transactions = useMemo(() => {
    return getOrdersForStore(storeSlug)
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((order) => ({
        id: "tx-" + order.id,
        orderId: order.id,
        description: "Order payment " + order.orderNumber,
        date: order.date,
        amount: order.total,
        method: order.paymentMethod || "Unknown",
        statusLabel:
          order.paymentStatus === "paid"
            ? "Received"
            : order.paymentStatus === "pending"
            ? "Pending"
            : order.paymentStatus === "refunded"
            ? "Refunded"
            : order.paymentStatus === "partially_refunded"
            ? "Partially refunded"
            : order.paymentStatus === "failed"
            ? "Failed"
            : "Unknown",
        statusTone:
          order.paymentStatus === "paid"
            ? ("success" as const)
            : order.paymentStatus === "pending"
            ? ("neutral" as const)
            : order.paymentStatus === "failed"
            ? ("danger" as const)
            : ("warning" as const),
      }));
  }, [getOrdersForStore, storeSlug]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Every payment received through your storefront.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Transaction history
          </h2>
        </div>
        {transactions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              No transactions yet.
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
              When a customer pays, the transaction will appear here.
            </p>
          </div>
        ) : (
          <ul
            role="list"
            className="divide-y divide-neutral-200 dark:divide-neutral-800"
          >
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <AtlasIcon
                      name="cart"
                      className="h-5 w-5 text-neutral-500"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {tx.description}
                    </span>
                    <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {tx.date}
                      {" \u00B7 "}
                      {tx.method}
                    </span>
                  </span>
                </div>
                <div className="ml-3 flex items-center gap-3">
                  <span
                    className={cn(
                      "hidden items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 sm:inline-flex",
                      tx.statusTone === "success"
                        ? "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800"
                        : tx.statusTone === "danger"
                        ? "bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800"
                        : tx.statusTone === "warning"
                        ? "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800"
                        : "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700"
                    )}
                  >
                    {tx.statusLabel}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {"GH\u20B5 "}
                    {tx.amount.toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}