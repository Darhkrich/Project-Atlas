// components/admin/customers/customer-list-item.tsx
"use client";

import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  getInitials,
} from "@/lib/admin/formatters";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  RISK_VARIANT,
  STATUS_VARIANT,
  SOURCE_LABEL,
} from "@/lib/admin/customers/constants";
import type { Customer } from "@/lib/admin/types/customer";

interface CustomerListItemProps {
  customer: Customer;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
}

export function CustomerListItem({
  customer,
  isSelected,
  onToggleSelect,
  onOpen,
}: CustomerListItemProps) {
  const now = useNow();
  const checkboxId = `customer-select-${customer.id}`;

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-white transition-all dark:bg-neutral-900",
        "border-neutral-200 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-700",
        isSelected &&
          "border-brand-500 ring-2 ring-brand-500 dark:bg-brand-900/20"
      )}
    >
      <label
        htmlFor={checkboxId}
        className="absolute left-3 top-3 z-10 flex h-4 w-4 cursor-pointer items-center justify-center"
        aria-label={`Select ${customer.name}`}
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(customer.id)}
          className="h-4 w-4"
        />
      </label>

      <button
        type="button"
        onClick={() => onOpen(customer.id)}
        className="w-full rounded-xl p-4 pl-10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {getInitials(customer.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {customer.name}
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {customer.phone}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Badge variant={STATUS_VARIANT[customer.status]} size="sm">
                  {customer.status}
                </Badge>
                <Badge variant={RISK_VARIANT[customer.riskLevel]} size="sm">
                  {customer.riskLevel}
                </Badge>
              </div>
            </div>

            <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
              {SOURCE_LABEL[customer.source]} customer
            </p>

            {customer.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Spent
                </p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Orders
                </p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {customer.totalOrders}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Points
                </p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {customer.atlasPointsBalance}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Last active
                </p>
                <p className="text-[11px] font-medium text-neutral-800 dark:text-neutral-200">
                  <time
                    dateTime={customer.lastActive}
                    title={formatAbsolute(customer.lastActive)}
                  >
                    {formatRelative(customer.lastActive, now)}
                  </time>
                </p>
              </div>
            </div>

            {customer.lastOrderDate && (
              <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <AtlasIcon name="clock" className="h-3 w-3" />
                Last order{" "}
                <time
                  dateTime={customer.lastOrderDate}
                  title={formatAbsolute(customer.lastOrderDate)}
                >
                  {formatRelative(customer.lastOrderDate, now)}
                </time>
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}