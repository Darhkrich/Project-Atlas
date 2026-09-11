"use client";

import { Customer } from "@/lib/admin/types/customer";
import { formatCurrency } from "@/lib/admin/formatters";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface CustomerListItemProps {
  customer: Customer;
  isSelected: boolean;
  onClick: (customer: Customer) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CustomerListItem({
  customer,
  isSelected,
  onClick,
}: CustomerListItemProps) {
  const statusVariant =
    customer.status === "active"
      ? "success"
      : customer.status === "suspended"
      ? "danger"
      : "neutral";

  const riskVariant =
    customer.riskLevel === "high"
      ? "danger"
      : customer.riskLevel === "medium"
      ? "warning"
      : "success";

  return (
    <button
      onClick={() => onClick(customer)}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
        isSelected
          ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500 dark:bg-brand-900/20"
          : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
          {getInitials(customer.name)}
        </div>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{customer.name}</p>
              {customer.storefrontId && (
                <p className="text-xs text-neutral-500">
                  {customer.storefrontType} · {customer.storefrontId}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              <Badge variant={statusVariant}>{customer.status}</Badge>
              <Badge variant={riskVariant}>{customer.riskLevel}</Badge>
            </div>
          </div>

          {/* Tags */}
          {customer.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {customer.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Metrics row */}
          <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
            <div>
              <p className="text-xs text-neutral-500">Spent</p>
              <p className="font-semibold">
                {formatCurrency(customer.totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Orders</p>
              <p className="font-semibold">{customer.totalOrders}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Wallet</p>
              <p className="font-semibold">
                {formatCurrency(customer.walletBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Last Active</p>
              <p className="text-xs font-medium">
                {timeAgo(customer.lastActive)}
              </p>
            </div>
          </div>

          {/* Footer: last order */}
          {customer.lastOrderDate && (
            <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
              <AtlasIcon name="clock" className="h-3 w-3" />
              Last order {timeAgo(customer.lastOrderDate)}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}