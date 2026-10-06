"use client";

import { cn } from "@/lib/utils";
import { LOW_STOCK_THRESHOLD } from "@/lib/merchant/products/constants";
import {
  STOCK_LABEL_LOW,
  STOCK_LABEL_OUT,
  STOCK_LABEL_UNTRACKED,
} from "@/lib/merchant/products/labels";

interface StockBadgeProps {
  stockLevel: number | null;
  inStock: boolean;
}

export function StockBadge({ stockLevel, inStock }: StockBadgeProps) {
  if (stockLevel === null) {
    return (
      <span className="text-xs text-neutral-400 dark:text-neutral-500">
        {STOCK_LABEL_UNTRACKED}
      </span>
    );
  }

  if (!inStock || stockLevel <= 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
          "bg-danger-50 text-danger-700 ring-danger-200",
          "dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800"
        )}
      >
        {STOCK_LABEL_OUT}
      </span>
    );
  }

  if (stockLevel <= LOW_STOCK_THRESHOLD) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
          "bg-warning-50 text-warning-700 ring-warning-200",
          "dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800"
        )}
      >
        <span aria-hidden="true">{stockLevel}</span>
        <span className="text-[10px] uppercase tracking-wide">
          {STOCK_LABEL_LOW}
        </span>
      </span>
    );
  }

  return (
    <span className="text-sm tabular-nums text-neutral-700 dark:text-neutral-300">
      {stockLevel}
    </span>
  );
}