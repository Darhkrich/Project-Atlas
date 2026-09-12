// components/admin/customers/customer-summary-cards.tsx
"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

export interface CustomerSummaryData {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  suspendedCustomers: number;
  totalSpent: number;
  avgOrderValue: number;
}

interface CustomerSummaryCardsProps {
  data: CustomerSummaryData;
  activeStatus: string;
  activeLastActive: string;
  activeSort: string;
  onFilterAll: () => void;
  onFilterActive: () => void;
  onFilterSuspended: () => void;
  onSortBySpend: () => void;
}

interface CardConfig {
  key: string;
  label: string;
  value: string;
  sub: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  isActive: boolean;
  highlight?: boolean;
  onClick: () => void;
}

export function CustomerSummaryCards({
  data,
  activeStatus,
  activeLastActive,
  activeSort,
  onFilterAll,
  onFilterActive,
  onFilterSuspended,
  onSortBySpend,
}: CustomerSummaryCardsProps) {
  const cards: CardConfig[] = [
    {
      key: "total",
      label: "Total customers",
      value: data.totalCustomers.toLocaleString("en-GH"),
      sub: `${data.newThisMonth} new this month`,
      icon: "users",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      isActive:
        activeStatus === "" &&
        activeLastActive === "" &&
        activeSort === "lastActive",
      onClick: onFilterAll,
    },
    {
      key: "active",
      label: "Active",
      value: data.activeCustomers.toLocaleString("en-GH"),
      sub: "Engaged in last 30d",
      icon: "check-circle",
      color: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-success-900/20",
      isActive: activeLastActive === "30d" && activeStatus === "",
      onClick: onFilterActive,
    },
    {
      key: "suspended",
      label: "Suspended",
      value: data.suspendedCustomers.toLocaleString("en-GH"),
      sub: "Restricted access",
      icon: "x-circle",
      color: "text-danger-600 dark:text-danger-400",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      isActive: activeStatus === "suspended",
      highlight: data.suspendedCustomers > 0,
      onClick: onFilterSuspended,
    },
    {
      key: "spend",
      label: "Total spent",
      value: formatCurrency(data.totalSpent),
      sub: `Avg order: ${formatCurrency(data.avgOrderValue)}`,
      icon: "sales",
      color: "text-info-600 dark:text-info-400",
      bg: "bg-info-50 dark:bg-info-900/20",
      isActive: activeSort === "totalSpent",
      onClick: onSortBySpend,
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
                "ring-1 ring-danger-300 dark:ring-danger-800"
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