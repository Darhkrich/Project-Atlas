"use client";

import Link from "next/link";
import type { MerchantSubscription } from "@/lib/admin/types/ecommerce";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatDate } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import {
  BILLING_CYCLE_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
  SUBSCRIPTION_STATUS_VARIANT,
} from "@/lib/admin/ecommerce/subscription-labels";

interface SubscriptionsTableProps {
  subscriptions: MerchantSubscription[];
  onView: (sub: MerchantSubscription) => void;
}

export function SubscriptionsTable({
  subscriptions,
  onView,
}: SubscriptionsTableProps) {
  const now = useNow();

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No subscriptions match these filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Merchant subscriptions with plan, status, and billing
        </caption>
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <th scope="col" className="px-4 py-3">
              Merchant
            </th>
            <th scope="col" className="px-4 py-3">
              Plan
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
            <th scope="col" className="px-4 py-3">
              Billing cycle
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Amount
            </th>
            <th scope="col" className="px-4 py-3">
              Next billing
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr
              key={sub.id}
              data-subscription-id={sub.id}
              className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
            >
              <td className="px-4 py-3">
                <Link
                  href={"/admin/ecommerce/merchants/" + sub.merchantId}
                  className="rounded-sm font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
                >
                  {sub.merchantName}
                </Link>
                <p className="mt-0.5 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                  {sub.merchantId}
                </p>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium">{sub.planName}</div>
                {sub.discountPercent !== undefined && (
                  <p className="mt-0.5 text-xs text-success-700 dark:text-success-400">
                    {sub.discountPercent}% discount
                  </p>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant={SUBSCRIPTION_STATUS_VARIANT[sub.status]}
                  size="sm"
                >
                  {SUBSCRIPTION_STATUS_LABEL[sub.status]}
                </Badge>
              </td>
              <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                {BILLING_CYCLE_LABEL[sub.billingCycle]}
              </td>
              <td className="px-4 py-3 text-right font-medium text-neutral-900 dark:text-neutral-100">
                {formatCurrency(sub.amountPaid, sub.currency)}
              </td>
              <td className="px-4 py-3">
                <span
                  className="text-neutral-700 dark:text-neutral-300"
                  title={formatDate(sub.nextBillingDate)}
                >
                  {now
                    ? formatRelative(sub.nextBillingDate, now)
                    : formatDate(sub.nextBillingDate)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(sub)}
                  aria-label={"View " + sub.merchantName + " subscription"}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}