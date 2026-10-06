/* eslint-disable react-hooks/purity */
"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative } from "@/lib/shared/format";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_SHORT_LABELS } from "@/lib/merchant/orders/labels";
import type { DashboardOrderRow } from "@/lib/merchant/dashboard/types";

interface RecentOrdersCardProps {
  orders: DashboardOrderRow[];
  isDraft: boolean;
}

function statusBadgeClass(variant: DashboardOrderRow["statusVariant"]): string {
  switch (variant) {
    case "warning":
      return "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800";
    case "info":
      return "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800";
    case "brand":
      return "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:ring-brand-800";
    case "success":
      return "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800";
    case "danger":
      return "bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800";
    default:
      return "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700";
  }
}

export function RecentOrdersCard({
  orders,
  isDraft,
}: RecentOrdersCardProps) {
  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  return (
    <section
      aria-labelledby="dashboard-recent-orders"
      className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <h2
          id="dashboard-recent-orders"
          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Recent orders
        </h2>
        <Link
          href="/merchant/orders"
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          View all
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {isDraft
              ? "Publish your store so customers can find it."
              : "When your first order arrives, it will appear here."}
          </p>
          <Link
            href="/merchant/storefront"
            className="mt-3 inline-flex text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {isDraft ? "Publish your store" : "Preview your store"}
          </Link>
        </div>
      ) : (
        <ul
          role="list"
          className="divide-y divide-neutral-200 dark:divide-neutral-800"
        >
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={"/merchant/orders/" + order.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <AtlasIcon
                      name="package"
                      className="h-5 w-5 text-neutral-500"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {order.orderNumber}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1",
                          statusBadgeClass(order.statusVariant)
                        )}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </span>
                    <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {order.customerEmail}
                      {" \u00B7 "}
                      {formatRelative(
                        new Date(order.createdAt).toISOString(),
                        now
                      )}
                      {" \u00B7 "}
                      {PAYMENT_STATUS_SHORT_LABELS[order.paymentStatus]}
                    </span>
                  </span>
                </div>
                <span className="ml-3 shrink-0 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {"GH\u20B5 "}
                  {order.total.toFixed(2)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}