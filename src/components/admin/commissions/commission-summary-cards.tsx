"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface ResellerCommissionSummaryData {
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  todayCommissions: number;
  avgRate: number;
  comparison: {
    totalCommissions: number;
    pendingCommissions: number;
    paidCommissions: number;
    todayCommissions: number;
  };
}

export function ResellerCommissionSummaryCards({
  data,
}: {
  data: ResellerCommissionSummaryData;
}) {
  const cards: {
    label: string;
    value: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    change?: number;
  }[] = [
    {
      label: "Total Commissions",
      value: formatCurrency(data.totalCommissions),
      icon: "percent",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      change: data.comparison.totalCommissions,
    },
    {
      label: "Pending",
      value: formatCurrency(data.pendingCommissions),
      icon: "clock",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      change: data.comparison.pendingCommissions,
    },
    {
      label: "Paid",
      value: formatCurrency(data.paidCommissions),
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      change: data.comparison.paidCommissions,
    },
    {
      label: "Today",
      value: formatCurrency(data.todayCommissions),
      icon: "trending-up",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      change: data.comparison.todayCommissions,
    },
    {
      label: "Avg Rate",
      value: `${data.avgRate}%`,
      icon: "bar-chart",
      color: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={cn(
            "border-0 shadow-sm transition-shadow hover:shadow-md",
            card.bg
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
            {card.change !== undefined && (
              <p
                className={cn(
                  "mt-1 text-xs",
                  card.change >= 0 ? "text-success-600" : "text-danger-600"
                )}
              >
                {card.change >= 0 ? "▲" : "▼"} {Math.abs(card.change)}% vs prev
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

interface PlatformMarginSummaryData {
  totalMargin: number;
  todayMargin: number;
  monthMargin: number;
  avgMarginPercent: number;
}

export function PlatformMarginSummaryCards({
  data,
}: {
  data: PlatformMarginSummaryData;
}) {
  const cards: {
    label: string;
    value: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
  }[] = [
    {
      label: "Total Margin",
      value: formatCurrency(data.totalMargin),
      icon: "sales",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
    },
    {
      label: "Today's Margin",
      value: formatCurrency(data.todayMargin),
      icon: "trending-up",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
    },
    {
      label: "This Month",
      value: formatCurrency(data.monthMargin),
      icon: "calendar",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
    },
    {
      label: "Avg Margin %",
      value: `${data.avgMarginPercent}%`,
      icon: "percent",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={cn("border-0 shadow-sm", card.bg)}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {card.label}
              </p>
              <AtlasIcon name={card.icon} className={cn("h-4 w-4", card.color)} />
            </div>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}