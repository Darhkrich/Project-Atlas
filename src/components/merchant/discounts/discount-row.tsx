"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/shared/format";
import type { Discount } from "@/types/merchant-storefront";

interface DiscountRowProps {
  discount: Discount;
  now: number;
  onToggleEnabled: (next: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function describeValue(discount: Discount): string {
  if (discount.type === "percent") {
    return discount.value + "% off";
  }
  return "GH\u20B5 " + discount.value + " off";
}

export function DiscountRow({
  discount,
  now,
  onToggleEnabled,
  onEdit,
  onDelete,
}: DiscountRowProps) {
  const expired =
    typeof discount.expiresAt === "number" && discount.expiresAt < now;

  const showMinOrder =
    typeof discount.minOrderValue === "number" && discount.minOrderValue > 0;

  const showUsage = typeof discount.maxUses === "number";

  const expiryText =
    typeof discount.expiresAt === "number"
      ? "Expires " + formatDate(new Date(discount.expiresAt).toISOString())
      : "No expiry";

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-white p-4 transition dark:bg-neutral-900 sm:flex-row sm:items-center sm:gap-4",
        expired
          ? "border-neutral-200 opacity-60 dark:border-neutral-800"
          : "border-neutral-200 dark:border-neutral-800"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-base font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
            {discount.code}
          </span>
          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
            {describeValue(discount)}
          </span>
          {expired && (
            <span className="rounded-full bg-danger-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-danger-700 dark:bg-danger-900/40 dark:text-danger-300">
              Expired
            </span>
          )}
          {!discount.enabled && !expired && (
            <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              Disabled
            </span>
          )}
        </div>

        <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {showMinOrder &&
            "Min GH\u20B5 " + discount.minOrderValue + "  \u00B7  "}
          {showUsage &&
            discount.usedCount +
              " of " +
              discount.maxUses +
              " used  \u00B7  "}
          {!showUsage && discount.usedCount + " used  \u00B7  "}
          {expiryText}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            {discount.enabled ? "Active" : "Off"}
          </span>
          <span className="relative inline-flex h-5 w-9 items-center">
            <input
              type="checkbox"
              checked={discount.enabled}
              onChange={(e) => onToggleEnabled(e.target.checked)}
              className="peer sr-only"
              aria-label={
                (discount.enabled ? "Disable " : "Enable ") + discount.code
              }
            />
            <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 dark:bg-neutral-700" />
            <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>

        <button
          type="button"
          onClick={onEdit}
          aria-label={"Edit " + discount.code}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="edit" className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={"Delete " + discount.code}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-danger-500 hover:text-danger-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-danger-500 dark:hover:text-danger-400"
        >
          <AtlasIcon name="trash" className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}