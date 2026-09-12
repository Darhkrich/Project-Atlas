// components/admin/resellers/reseller-summary-cards.tsx
"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";

export interface ResellerSummaryData {
  totalResellers: number;
  activeResellers: number;
  pendingVerification: number;
  suspendedResellers: number;
  pendingPayoutTotal: number;
  newThisMonth: number;
}

interface ResellerSummaryCardsProps {
  data: ResellerSummaryData;
  activeStatus: string;
  activeVerification: string;
  activeSort: string;
  onFilterAll: () => void;
  onFilterActive: () => void;
  onFilterPending: () => void;
  onFilterSuspended: () => void;
  onSortByPendingPayout: () => void;
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

export function ResellerSummaryCards({
  data,
  activeStatus,
  activeVerification,
  activeSort,
  onFilterAll,
  onFilterActive,
  onFilterPending,
  onFilterSuspended,
  onSortByPendingPayout,
}: ResellerSummaryCardsProps) {
  const cards: CardConfig[] = [
    {
      key: "total",
      label: "Total resellers",
      value: data.totalResellers,
      sub:
        data.newThisMonth > 0
          ? `${data.newThisMonth} new this month`
          : "All accounts",
      icon: "users",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      isActive: activeStatus === "" && activeVerification === "",
      onClick: onFilterAll,
    },
    {
      key: "active",
      label: "Active",
      value: data.activeResellers,
      sub: "Operational accounts",
      icon: "check-circle",
      color: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-success-900/20",
      isActive: activeStatus === "active",
      onClick: onFilterActive,
    },
    {
      key: "pending",
      label: "Pending verification",
      value: data.pendingVerification,
      sub: "Awaiting review",
      icon: "clock",
      color: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      isActive: activeVerification === "pending",
      highlight: data.pendingVerification > 0,
      onClick: onFilterPending,
    },
    {
      key: "suspended",
      label: "Suspended",
      value: data.suspendedResellers,
      sub: "Restricted accounts",
      icon: "x-circle",
      color: "text-danger-600 dark:text-danger-400",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      isActive: activeStatus === "suspended",
      highlight: data.suspendedResellers > 0,
      onClick: onFilterSuspended,
    },
    {
      key: "payouts",
      label: "Pending payouts",
      value: formatCurrency(data.pendingPayoutTotal),
      sub: "Owed to resellers",
      icon: "percent",
      color: "text-info-600 dark:text-info-400",
      bg: "bg-info-50 dark:bg-info-900/20",
      isActive: activeSort === "commissionsPending",
      onClick: onSortByPendingPayout,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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