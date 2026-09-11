"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface ResellerSummaryData {
  totalResellers: number;
  activeResellers: number;
  pendingVerification: number;
  suspendedResellers: number;
  totalCommissions: number;
  newThisMonth?: number;
}

interface ResellerSummaryCardsProps {
  data: ResellerSummaryData;
  onFilterAll?: () => void;
  onFilterActive?: () => void;
  onFilterPending?: () => void;
  onFilterSuspended?: () => void;
}

export function ResellerSummaryCards({
  data,
  onFilterAll,
  onFilterActive,
  onFilterPending,
  onFilterSuspended,
}: ResellerSummaryCardsProps) {
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
      label: "Total Resellers",
      value: data.totalResellers,
      sub: data.newThisMonth
        ? `${data.newThisMonth} new this month`
        : "All accounts",
      icon: "users",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
    },
    {
      label: "Active",
      value: data.activeResellers,
      sub: "Operational accounts",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      onClick: onFilterActive,
    },
    {
      label: "Pending Verification",
      value: data.pendingVerification,
      sub: "Awaiting review",
      icon: "clock",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: data.pendingVerification > 0,
      onClick: onFilterPending,
    },
    {
      label: "Suspended",
      value: data.suspendedResellers,
      sub: "Restricted accounts",
      icon: "x-circle",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      highlight: data.suspendedResellers > 0,
      onClick: onFilterSuspended,
    },
    {
      label: "Total Commissions",
      value: formatCurrency(data.totalCommissions),
      sub: "Lifetime earned",
      icon: "percent",
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