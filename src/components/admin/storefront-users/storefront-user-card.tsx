"use client";

import { Customer } from "@/lib/admin/types/customer";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface StorefrontUserCardProps {
  user: Customer;
  isSelected: boolean;
  onClick: (user: Customer) => void;
  onViewStorefront?: (storefrontId: string) => void;
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

export function StorefrontUserCard({
  user,
  isSelected,
  onClick,
  onViewStorefront,
}: StorefrontUserCardProps) {
  const statusVariant =
    user.status === "active"
      ? "success"
      : user.status === "suspended"
      ? "danger"
      : "neutral";

  const riskVariant =
    user.riskLevel === "high"
      ? "danger"
      : user.riskLevel === "medium"
      ? "warning"
      : "success";

  return (
    <button
      onClick={() => onClick(user)}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
        isSelected
          ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500 dark:bg-brand-900/20"
          : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
          {getInitials(user.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold">{user.name}</p>
            <div className="flex shrink-0 gap-1">
              <Badge variant={statusVariant}>{user.status}</Badge>
              <Badge variant={riskVariant}>{user.riskLevel}</Badge>
            </div>
          </div>

          {/* Storefront badge */}
          <div className="mt-1 flex items-center gap-1">
            <Badge variant="info">
              <AtlasIcon name="store" className="mr-1 h-3 w-3" />
              {user.storefrontId}
            </Badge>
            {onViewStorefront && user.storefrontId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewStorefront(user.storefrontId!);
                }}
                className="text-xs text-brand-600 hover:underline"
              >
                View store →
              </button>
            )}
          </div>

          {/* Tags */}
          {user.tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {user.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Metrics */}
          <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
            <div>
              <p className="text-xs text-neutral-500">Spent</p>
              <p className="font-semibold">
                {formatCurrency(user.totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Orders</p>
              <p className="font-semibold">{user.totalOrders}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Wallet</p>
              <p className="font-semibold">
                {formatCurrency(user.walletBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Last Active</p>
              <p className="text-xs font-medium">
                {timeAgo(user.lastActive)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}