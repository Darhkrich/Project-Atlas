// components/admin/merchant-storefront-users/merchant-storefront-user-card.tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/admin/ui/badge";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { formatCurrency, getInitials } from "@/lib/admin/formatters";
import { routes } from "@/lib/admin/routes";
import {
  RISK_VARIANT,
  SEGMENT_LABEL,
  SEGMENT_VARIANT,
  STATUS_VARIANT,
  STOREFRONT_STATUS_VARIANT,
} from "@/lib/admin/storefront-users/constants";
import type { StorefrontUser } from "@/lib/admin/types/storefront-user";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";

interface MerchantStorefrontUserCardProps {
  user: StorefrontUser;
  storefront?: UnifiedStorefront;
  isSelected: boolean;
  isFocused: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onFocus: (id: string) => void;
}

export function MerchantStorefrontUserCard({
  user,
  storefront,
  isSelected,
  isFocused,
  onToggleSelect,
  onOpen,
  onFocus,
}: MerchantStorefrontUserCardProps) {
  const now = useNow();
  const checkboxId = `msfu-select-${user.id}`;
  const displayName = storefront?.storeName ?? user.storeName;
  const aov = user.ordersCount > 0 ? user.totalSpent / user.ordersCount : 0;

  return (
    <div
      data-storefront-user-id={user.id}
      onMouseEnter={() => onFocus(user.id)}
      className={cn(
        "relative flex flex-col rounded-xl border bg-white transition-all dark:bg-neutral-900",
        "border-neutral-200 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-700",
        isSelected &&
          "border-brand-500 ring-2 ring-brand-500 dark:bg-brand-900/20",
        isFocused && !isSelected && "ring-1 ring-brand-300 dark:ring-brand-800"
      )}
    >
      <label
        htmlFor={checkboxId}
        className="absolute left-3 top-3 z-10 flex h-4 w-4 cursor-pointer items-center justify-center"
        aria-label={`Select ${user.name}`}
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(user.id)}
          className="h-4 w-4"
        />
      </label>

      <button
        type="button"
        onClick={() => onOpen(user.id)}
        className="w-full rounded-t-xl p-4 pl-10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {getInitials(user.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {user.name}
              </p>
              <div className="flex shrink-0 items-center gap-1.5">
                <StatusDot
                  tone={
                    user.status === "active"
                      ? "success"
                      : user.status === "suspended"
                      ? "danger"
                      : "neutral"
                  }
                  size="sm"
                />
                <Badge variant={STATUS_VARIANT[user.status]} size="sm">
                  {user.status}
                </Badge>
                {user.segment && (
                  <Badge
                    variant={SEGMENT_VARIANT[user.segment]}
                    size="sm"
                  >
                    {SEGMENT_LABEL[user.segment]}
                  </Badge>
                )}
              </div>
            </div>

            {user.country && (
              <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                {user.country}
              </p>
            )}

            {user.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {user.tags.map((tag) => (
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
                  {formatCurrency(user.totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Orders
                </p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {user.ordersCount}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">AOV</p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(aov)}
                </p>
              </div>
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Risk
                </p>
                <p
                  className={cn(
                    "text-[11px] font-medium",
                    user.riskLevel === "high"
                      ? "text-danger-700 dark:text-danger-300"
                      : user.riskLevel === "medium"
                      ? "text-warning-700 dark:text-warning-300"
                      : "text-success-700 dark:text-success-300"
                  )}
                >
                  {RISK_VARIANT[user.riskLevel] === "danger"
                    ? "High"
                    : user.riskLevel === "medium"
                    ? "Medium"
                    : "Low"}
                </p>
              </div>
            </div>

            {user.lastOrderAt && (
              <p className="mt-2 flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                <AtlasIcon name="clock" className="h-3 w-3" />
                Last order{" "}
                <time
                  dateTime={user.lastOrderAt}
                  title={formatAbsolute(user.lastOrderAt)}
                >
                  {formatRelative(user.lastOrderAt, now)}
                </time>
              </p>
            )}
          </div>
        </div>
      </button>

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 px-4 py-2 text-xs dark:border-neutral-800">
        <Badge
          variant={
            storefront
              ? STOREFRONT_STATUS_VARIANT[storefront.status]
              : "neutral"
          }
          size="sm"
        >
          <AtlasIcon name="store" className="mr-1 h-3 w-3" />
          {displayName}
        </Badge>
        {storefront && (
          <span className="text-neutral-500 dark:text-neutral-400">
            {formatCurrency(storefront.revenue30d)} · 30d
          </span>
        )}
        {!storefront && (
          <span className="text-warning-700 dark:text-warning-300">
            Storefront unavailable
          </span>
        )}
        {storefront && (
          <Link
            href={routes.merchantStorefrontDetail(storefront.id)}
            className="ml-auto text-brand-700 hover:underline dark:text-brand-300"
            onClick={(e) => e.stopPropagation()}
          >
            View store
          </Link>
        )}
      </div>
    </div>
  );
}