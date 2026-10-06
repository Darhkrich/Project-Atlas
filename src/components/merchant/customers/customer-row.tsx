/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative, getInitials } from "@/lib/shared/format";
import { SEGMENT_LABELS } from "@/lib/merchant/customers/labels";
import type { MerchantCustomerView } from "@/lib/merchant/customers/types";
import { cn } from "@/lib/utils";

interface CustomerRowProps {
  customer: MerchantCustomerView;
  onReport: (customer: MerchantCustomerView) => void;
}

function segmentClass(
  segment: MerchantCustomerView["segment"]
): string {
  switch (segment) {
    case "vip":
      return "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:ring-brand-800";
    case "returning":
      return "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800";
    default:
      return "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700";
  }
}

export function CustomerRow({ customer, onReport }: CustomerRowProps) {
  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  const lastActivityText =
    customer.lastOrderAt !== null
      ? formatRelative(new Date(customer.lastOrderAt).toISOString(), now)
      : "No orders";

  return (
    <tr className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
      <td className="px-5 py-4">
        <Link
          href={"/merchant/customers/" + customer.id}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
            {getInitials(customer.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {customer.name}
            </span>
            <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">
              {customer.email}
            </span>
          </span>
        </Link>
      </td>

      <td className="px-5 py-4 text-sm text-neutral-600 dark:text-neutral-400">
        {customer.phone || "\u2014"}
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          {customer.orderCount}
          {customer.segment === "vip" && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1",
                segmentClass(customer.segment)
              )}
            >
              VIP
            </span>
          )}
        </span>
      </td>

      <td className="px-5 py-4 text-sm font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
        {"GH\u20B5 "}
        {customer.totalSpent.toFixed(2)}
      </td>

      <td className="px-5 py-4 text-xs text-neutral-500 dark:text-neutral-400">
        {lastActivityText}
      </td>

      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Link
            href={"/merchant/customers/" + customer.id}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
            aria-label={"View " + customer.name}
          >
            <AtlasIcon name="eye" className="h-4 w-4" aria-hidden="true" />
          </Link>
          {customer.email && (
            <a
              href={"mailto:" + customer.email}
              className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
              aria-label={"Email " + customer.name}
            >
              <AtlasIcon name="send" className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          <button
            type="button"
            onClick={() => onReport(customer)}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/30 dark:hover:text-danger-300"
            aria-label={"Report " + customer.name}
          >
            <AtlasIcon name="alert" className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}