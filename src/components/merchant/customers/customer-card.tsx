/* eslint-disable react-hooks/purity */
"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative, getInitials } from "@/lib/shared/format";
import type { MerchantCustomerView } from "@/lib/merchant/customers/types";

interface CustomerCardProps {
  customer: MerchantCustomerView;
  onReport: (customer: MerchantCustomerView) => void;
}

export function CustomerCard({ customer, onReport }: CustomerCardProps) {
  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  const lastActivityText =
    customer.lastOrderAt !== null
      ? formatRelative(new Date(customer.lastOrderAt).toISOString(), now)
      : "No orders";

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <Link
        href={"/merchant/customers/" + customer.id}
        className="flex items-start gap-3"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          {getInitials(customer.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {customer.name}
          </span>
          <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-400">
            {customer.email}
          </span>
          {customer.phone && (
            <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
              {customer.phone}
            </span>
          )}
        </span>
      </Link>

      <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <div>
          <p className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
            {"GH\u20B5 "}
            {customer.totalSpent.toFixed(2)}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {customer.orderCount === 1
              ? "1 order"
              : customer.orderCount + " orders"}
          </p>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {lastActivityText}
        </p>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <Link
          href={"/merchant/customers/" + customer.id}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="eye" className="h-3.5 w-3.5" aria-hidden="true" />
          View
        </Link>
        {customer.email && (
          <a
            href={"mailto:" + customer.email}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="send" className="h-3.5 w-3.5" aria-hidden="true" />
            Email
          </a>
        )}
        <button
          type="button"
          onClick={() => onReport(customer)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-danger-50 hover:text-danger-700 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-danger-900/30 dark:hover:text-danger-300"
        >
          <AtlasIcon name="alert" className="h-3.5 w-3.5" aria-hidden="true" />
          Report
        </button>
      </div>
    </div>
  );
}