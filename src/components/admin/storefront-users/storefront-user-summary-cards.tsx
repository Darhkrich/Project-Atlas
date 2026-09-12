// components/admin/storefront-users/storefront-user-summary-cards.tsx
"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";
import type { StorefrontUser } from "@/lib/admin/types/storefront-user";

interface StorefrontUserSummaryCardsProps {
  users: StorefrontUser[];
  storefrontCount: number;
  activeStatus: string;
  activeRisk: string;
  onFilterAll: () => void;
  onFilterActive: () => void;
  onFilterSuspended: () => void;
  onFilterHighRisk: () => void;
}

interface CardConfig {
  key: string;
  label: string;
  value: string | number;
  sub: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  isActive: boolean;
  highlight?: boolean;
  onClick: () => void;
}

export function StorefrontUserSummaryCards({
  users,
  storefrontCount,
  activeStatus,
  activeRisk,
  onFilterAll,
  onFilterActive,
  onFilterSuspended,
  onFilterHighRisk,
}: StorefrontUserSummaryCardsProps) {
  const total = users.length;
  const active = users.filter((u) => u.status === "active").length;
  const suspended = users.filter((u) => u.status === "suspended").length;
  const highRisk = users.filter((u) => u.riskLevel === "high").length;
  const totalSpent = users.reduce((sum, u) => sum + u.totalSpent, 0);

  const cards: CardConfig[] = [
    {
      key: "total",
      label: "Total users",
      value: total,
      sub: `${storefrontCount} storefront${storefrontCount === 1 ? "" : "s"}`,
      icon: "users",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      isActive: activeStatus === "" && activeRisk === "",
      onClick: onFilterAll,
    },
    {
      key: "active",
      label: "Active",
      value: active,
      sub: "Engaged users",
      icon: "check-circle",
      color: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-success-900/20",
      isActive: activeStatus === "active",
      onClick: onFilterActive,
    },
    {
      key: "suspended",
      label: "Suspended",
      value: suspended,
      sub: "Restricted access",
      icon: "x-circle",
      color: "text-danger-600 dark:text-danger-400",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      isActive: activeStatus === "suspended",
      highlight: suspended > 0,
      onClick: onFilterSuspended,
    },
    {
      key: "high-risk",
      label: "High risk",
      value: highRisk,
      sub: `${formatCurrency(totalSpent)} total spent`,
      icon: "alert-triangle",
      color: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      isActive: activeRisk === "high",
      highlight: highRisk > 0,
      onClick: onFilterHighRisk,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          aria-pressed={card.isActive}
          onClick={card.onClick}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <div
            className={cn(
              "rounded-lg border-0 p-4 shadow-sm transition-shadow hover:shadow-md",
              card.bg,
              card.isActive && "ring-2 ring-brand-500",
              card.highlight &&
                !card.isActive &&
                "ring-1 ring-warning-300 dark:ring-warning-800"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                {card.label}
              </p>
              <AtlasIcon
                name={card.icon}
                className={cn("h-4 w-4", card.color)}
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {card.value}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {card.sub}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}