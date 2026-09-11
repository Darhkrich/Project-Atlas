/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { MerchantSubscription, Invoice } from "@/lib/admin/types/ecommerce";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { Input } from "@/components/admin/ui/input";

interface SubscriptionDetailDrawerProps {
  subscription: MerchantSubscription | null;
  invoices: Invoice[];
  onClose: () => void;
  onChangePlan: (subscriptionId: string, newPlanCode: string) => void;
  onApplyDiscount: (subscriptionId: string, discountPercent: number) => void;
  onCancelSubscription: (subscriptionId: string, reason: string) => void;
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  past_due: "warning",
  cancelled: "danger",
  expired: "neutral",
};

export function SubscriptionDetailDrawer({
  subscription,
  invoices,
  onClose,
  onChangePlan,
  onApplyDiscount,
  onCancelSubscription,
}: SubscriptionDetailDrawerProps) {
  const [selectedPlan, setSelectedPlan] = useState(subscription?.planCode || "starter");
  const [discount, setDiscount] = useState(0);
  const [cancelReason, setCancelReason] = useState("");

  if (!subscription) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Subscription Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <p className="text-sm text-neutral-500">Merchant</p>
            <p className="font-medium">{subscription.merchantName}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Plan</p>
            <p className="font-medium">{subscription.planName}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Status</p>
            <Badge variant={statusVariantMap[subscription.status]}>{subscription.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500">Start Date</p>
              <p className="font-medium">{new Date(subscription.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">End Date</p>
              <p className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-neutral-500">Billing Cycle</p>
              <p className="font-medium capitalize">{subscription.billingCycle}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Amount Paid</p>
              <p className="font-medium">{formatCurrency(subscription.amountPaid)}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Last Payment</p>
            <p className="font-medium">{new Date(subscription.lastPaymentDate).toLocaleDateString()}</p>
          </div>

          {/* Invoices */}
          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="text-sm font-medium mb-2">Invoices</p>
            {invoices.length === 0 ? (
              <p className="text-sm text-neutral-400">No invoices.</p>
            ) : (
              <ul className="space-y-2">
                {invoices.map(inv => (
                  <li key={inv.id} className="flex items-center justify-between rounded-md bg-neutral-50 p-2 text-sm dark:bg-neutral-900">
                    <span className="font-mono text-xs">{inv.id}</span>
                    <span className="font-medium">{formatCurrency(inv.amount)}</span>
                    <span className="text-xs text-neutral-500">{new Date(inv.date).toLocaleDateString()}</span>
                    <Badge variant={inv.status === "paid" ? "success" : inv.status === "unpaid" ? "warning" : "neutral"}>{inv.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Change Plan */}
          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="text-sm font-medium mb-2">Change Plan</p>
            <div className="flex gap-2">
              <select
                className="h-10 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                value={selectedPlan}
                onChange={e => setSelectedPlan(e.target.value)}
              >
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>
              <Button size="sm" onClick={() => onChangePlan(subscription.id, selectedPlan)}>Apply</Button>
            </div>
          </div>

          {/* Discount */}
          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="text-sm font-medium mb-2">Apply Discount (%)</p>
            <div className="flex gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                placeholder="Discount %"
              />
              <Button size="sm" onClick={() => onApplyDiscount(subscription.id, discount)}>Apply</Button>
            </div>
          </div>

          {/* Cancel Subscription */}
          <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
            <p className="text-sm font-medium mb-2">Cancel Subscription</p>
            <Input
              placeholder="Cancellation reason"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
            />
            <Button
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={() => onCancelSubscription(subscription.id, cancelReason)}
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}