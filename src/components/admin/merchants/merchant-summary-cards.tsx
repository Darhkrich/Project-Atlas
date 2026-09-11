"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface MerchantSummaryData {
  totalMerchants: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  totalSales: number;
  liveStores: number;
  suspendedMerchants?: number;
}

interface MerchantSummaryCardsProps {
  data: MerchantSummaryData;
  onFilterAll?: () => void;
  onFilterActive?: () => void;
  onFilterPastDue?: () => void;
  onFilterSuspended?: () => void;
}

export function MerchantSummaryCards({
  data,
  onFilterAll,
  onFilterActive,
  onFilterPastDue,
  onFilterSuspended,
}: MerchantSummaryCardsProps) {
  const cards: {
    label: string;
    value: string | number;
    sub: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    highlight?: boolean;
    onClick?: () => void;
  }[] = [
    {
      label: "Total Merchants",
      value: data.totalMerchants,
      sub: `${data.liveStores} live stores`,
      icon: "briefcase",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
    },
    {
      label: "Active Subscriptions",
      value: data.activeSubscriptions,
      sub: "Billing in good standing",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      onClick: onFilterActive,
    },
    {
      label: "Past Due",
      value: data.pendingSubscriptions,
      sub: "Needs review",
      icon: "clock",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: data.pendingSubscriptions > 0,
      onClick: onFilterPastDue,
    },
    {
      label: "Suspended",
      value: data.suspendedMerchants ?? 0,
      sub: "Restricted access",
      icon: "x-circle",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      highlight: (data.suspendedMerchants ?? 0) > 0,
      onClick: onFilterSuspended,
    },
    {
      label: "Total Sales Volume",
      value: formatCurrency(data.totalSales),
      sub: "Across all merchants",
      icon: "sales",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card
          key={card.label}
          onClick={card.onClick}
          className={cn(
            "border-0 shadow-sm transition-all hover:shadow-md",
            card.bg,
            card.highlight && "ring-1 ring-warning-300 dark:ring-warning-800",
            card.onClick && "cursor-pointer"
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {card.label}
              </p>
              <AtlasIcon name={card.icon} className={cn("h-4 w-4", card.color)} />
            </div>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-neutral-500">{card.sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}