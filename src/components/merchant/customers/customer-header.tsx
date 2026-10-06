"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { getInitials } from "@/lib/shared/format";
import { SEGMENT_LABELS } from "@/lib/merchant/customers/labels";
import type { MerchantCustomerView } from "@/lib/merchant/customers/types";
import { cn } from "@/lib/utils";

interface CustomerHeaderProps {
  customer: MerchantCustomerView;
  onReport: () => void;
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

export function CustomerHeader({ customer, onReport }: CustomerHeaderProps) {
  const hasPhone = customer.phone.trim().length > 0;

  return (
    <div className="space-y-4">
      <Link
        href="/merchant/customers"
        className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
      >
        <AtlasIcon name="arrow-left" className="h-4 w-4" aria-hidden="true" />
        Back to customers
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
            {getInitials(customer.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
                {customer.name}
              </h1>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                  segmentClass(customer.segment)
                )}
              >
                {SEGMENT_LABELS[customer.segment]}
              </span>
            </div>
            <p className="mt-1 truncate text-sm text-neutral-600 dark:text-neutral-400">
              {customer.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {customer.email && (
            <a
              href={"mailto:" + customer.email}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              aria-label={"Email " + customer.name}
            >
              <AtlasIcon name="send" className="h-4 w-4" aria-hidden="true" />
              Email
            </a>
          )}
          {hasPhone && (
            <a
              href={"tel:" + customer.phone}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              aria-label={"Call " + customer.name}
            >
              <AtlasIcon name="phone" className="h-4 w-4" aria-hidden="true" />
              Call
            </a>
          )}
          <button
            type="button"
            onClick={onReport}
            disabled={customer.hasActiveReport}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
              customer.hasActiveReport
                ? "cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-500"
                : "border-danger-200 bg-white text-danger-700 hover:bg-danger-50 dark:border-danger-900 dark:bg-neutral-900 dark:text-danger-300 dark:hover:bg-danger-900/20"
            )}
            aria-label="Report customer"
          >
            <AtlasIcon name="alert" className="h-4 w-4" aria-hidden="true" />
            {customer.hasActiveReport ? "Reported" : "Report"}
          </button>
        </div>
      </div>
    </div>
  );
}