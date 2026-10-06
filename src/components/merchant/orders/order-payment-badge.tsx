"use client";

import { cn } from "@/lib/utils";
import { PAYMENT_STATUS_SHORT_LABELS } from "@/lib/merchant/orders/labels";
import type { CustomerOrderPaymentStatus } from "@/lib/merchant/orders/types";

interface OrderPaymentBadgeProps {
  paymentStatus: CustomerOrderPaymentStatus;
  size?: "sm" | "md";
}

function badgeClass(paymentStatus: CustomerOrderPaymentStatus): string {
  switch (paymentStatus) {
    case "paid":
      return "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800";
    case "pending":
      return "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700";
    case "refunded":
      return "bg-neutral-100 text-neutral-500 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700";
    case "partially_refunded":
      return "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800";
    case "failed":
      return "bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800";
  }
}

export function OrderPaymentBadge({
  paymentStatus,
  size = "md",
}: OrderPaymentBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1",
        size === "sm"
          ? "px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
          : "px-2 py-0.5 text-xs",
        badgeClass(paymentStatus)
      )}
    >
      {PAYMENT_STATUS_SHORT_LABELS[paymentStatus]}
    </span>
  );
}