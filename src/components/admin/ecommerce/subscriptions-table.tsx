"use client";

import { MerchantSubscription } from "@/lib/admin/types/ecommerce";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";

interface SubscriptionsTableProps {
  subscriptions: MerchantSubscription[];
  onView: (sub: MerchantSubscription) => void;
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  past_due: "warning",
  cancelled: "danger",
  expired: "neutral",
};

export function SubscriptionsTable({ subscriptions, onView }: SubscriptionsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr className="text-left text-xs font-semibold text-neutral-500">
            <th className="px-4 py-3">Merchant</th>
            <th className="px-4 py-3">Plan</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Billing Cycle</th>
            <th className="px-4 py-3">Amount Paid</th>
            <th className="px-4 py-3">Last Payment</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(sub => (
            <tr key={sub.id} className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50">
              <td className="px-4 py-3">
                <div className="font-medium">{sub.merchantName}</div>
                <div className="text-xs text-neutral-500">{sub.merchantId}</div>
              </td>
              <td className="px-4 py-3">{sub.planName}</td>
              <td className="px-4 py-3">
                <Badge variant={statusVariantMap[sub.status]}>{sub.status}</Badge>
              </td>
              <td className="px-4 py-3 capitalize">{sub.billingCycle}</td>
              <td className="px-4 py-3 font-medium">{formatCurrency(sub.amountPaid)}</td>
              <td className="px-4 py-3 text-neutral-500">{new Date(sub.lastPaymentDate).toLocaleDateString()}</td>
              <td className="px-4 py-3">
                <Button variant="ghost" size="sm" onClick={() => onView(sub)}>View</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}