"use client";

import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/merchant/orders/labels";
import type { CustomerOrderStatus } from "@/lib/merchant/orders/types";

interface OrderStatusBadgeProps {
  status: CustomerOrderStatus;
  size?: "sm" | "md";
}

function badgeClass(status: CustomerOrderStatus): string {
  switch (status) {
    case "new":
      return "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800";
    case "processing":
      return "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800";
    case "shipped":
      return "bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:ring-brand-800";
    case "delivered":
      return "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800";
    case "cancelled":
      return "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700";
  }
}

export function OrderStatusBadge({ status, size = "md" }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1",
        size === "sm"
          ? "px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
          : "px-2 py-0.5 text-xs",
        badgeClass(status)
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}