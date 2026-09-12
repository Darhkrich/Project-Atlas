// components/admin/merchant-storefront-users/merchant-storefront-user-summary-cards.tsx
"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";
import { HIGH_VALUE_THRESHOLD } from "@/lib/admin/storefront-users/constants";
import type { StorefrontUser } from "@/lib/admin/types/storefront-user";

interface MerchantStorefrontUserSummaryCardsProps {
  users: StorefrontUser[];
  storefrontCount: number;
  activeSegment: string;
  activeMinSpend: string;
  onFilterAll: () => void;
  onFilterRepeat: () => void;
  onFilterHighValue: () => void;
  onFilterAtRisk: () => void;
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

export function MerchantStorefrontUserSummaryCards({
  users,
  storefrontCount,
  activeSegment,
  activeMinSpend,
  onFilterAll,
  onFilterRepeat,
  onFilterHighValue,
  onFilterAtRisk,
}: MerchantStorefrontUserSummaryCardsProps) {
  const total = users.length;
  const repeat = users.filter((u) => u.ordersCount >= 2).length;
  const highValue = users.filter(
    (u) => u.totalSpent >= HIGH_VALUE_THRESHOLD
  ).length;
  const atRisk = users.filter((u) => u.segment === "at_risk").length;

  const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);
  const avgLtv = total > 0 ? totalRevenue / total : 0;
  const repeatPct = total > 0 ? Math.round((repeat / total) * 100) : 0;
  const highValueRevenue = users
    .filter((u) => u.totalSpent >= HIGH_VALUE_THRESHOLD)
    .reduce((sum, u) => sum + u.totalSpent, 0);
  const highValuePct =
    totalRevenue > 0 ? Math.round((highValueRevenue / totalRevenue) * 100) : 0;
  const atRiskRevenue = users
    .filter((u) => u.segment === "at_risk")
    .reduce((sum, u) => sum + u.totalSpent, 0);

  const cards: CardConfig[] = [
    {
      key: "total",
      label: "Total customers",
      value: total,
      sub: `Avg LTV ${formatCurrency(avgLtv)} · ${storefrontCount} stores`,
      icon: "users",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      isActive: activeSegment === "" && activeMinSpend === "",
      onClick: onFilterAll,
    },
    {
      key: "repeat",
      label: "Repeat buyers",
      value: repeat,
      sub: `${repeatPct}% of customer base`,
      icon: "repeat",
      color: "text-info-600 dark:text-info-400",
      bg: "bg-info-50 dark:bg-info-900/20",
      isActive: activeSegment === "repeat",
      onClick: onFilterRepeat,
    },
    {
      key: "high-value",
      label: "High value",
      value: highValue,
      sub: `${highValuePct}% of revenue`,
      icon: "star",
      color: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-success-900/20",
      isActive: activeMinSpend === String(HIGH_VALUE_THRESHOLD),
      highlight: highValue > 0,
      onClick: onFilterHighValue,
    },
    {
      key: "at-risk",
      label: "At risk",
      value: atRisk,
      sub: `${formatCurrency(atRiskRevenue)} revenue at stake`,
      icon: "alert-triangle",
      color: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      isActive: activeSegment === "at_risk",
      highlight: atRisk > 0,
      onClick: onFilterAtRisk,
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