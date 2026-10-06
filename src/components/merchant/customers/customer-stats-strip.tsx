/* eslint-disable react-hooks/purity */
"use client";

import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative } from "@/lib/shared/format";
import { MEMBER_SINCE_EMPTY } from "@/lib/merchant/customers/labels";
import type { MerchantCustomerView } from "@/lib/merchant/customers/types";

interface CustomerStatsStripProps {
  customer: MerchantCustomerView;
}

export function CustomerStatsStrip({ customer }: CustomerStatsStripProps) {
  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  const memberSinceText =
    customer.firstOrderAt !== null
      ? new Date(customer.firstOrderAt).toLocaleDateString("en-GH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : MEMBER_SINCE_EMPTY;

  const lastActivityText =
    customer.lastOrderAt !== null
      ? formatRelative(new Date(customer.lastOrderAt).toISOString(), now)
      : "No orders yet";

  return (
    <section aria-label="Customer statistics">
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Total orders
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {customer.orderCount}
          </dd>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Lifetime spend
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            {"GH\u20B5 "}
            {customer.totalSpent.toFixed(2)}
          </dd>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Member since
          </dt>
          <dd className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {memberSinceText}
          </dd>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Last activity
          </dt>
          <dd className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {lastActivityText}
          </dd>
        </div>
      </dl>
    </section>
  );
}