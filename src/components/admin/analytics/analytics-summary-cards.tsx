// components/admin/analytics/analytics-summary-cards.tsx
"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { COMPARISON_LABEL } from "@/lib/admin/analytics/contants";
import type { AnalyticsSummary, DateRangeKey } from "@/lib/admin/types/analytics";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";

interface AnalyticsSummaryCardsProps {
  data: AnalyticsSummary;
  range: DateRangeKey;
  onSelect: (target: string) => void;
}

interface CardConfig {
  key: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  bg: string;
  change: number;
  anchor?: string;
  higherIsBetter: boolean;
}

export function AnalyticsSummaryCards({
  data,
  range,
  onSelect,
}: AnalyticsSummaryCardsProps) {
  const cards: CardConfig[] = [
    {
      key: "revenue",
      label: "Total revenue",
      value: formatCurrency(data.totalRevenue),
      icon: "sales",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      change: data.comparison.totalRevenue,
      anchor: "revenue-trend",
      higherIsBetter: true,
    },
    {
      key: "orders",
      label: "Total orders",
      value: formatNumber(data.totalOrders),
      icon: "orders",
      color: "text-info-600 dark:text-info-400",
      bg: "bg-info-50 dark:bg-info-900/20",
      change: data.comparison.totalOrders,
      anchor: "order-volume",
      higherIsBetter: true,
    },
    {
      key: "users",
      label: "Active users",
      value: formatNumber(data.activeUsers),
      icon: "users",
      color: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-success-900/20",
      change: data.comparison.activeUsers,
      anchor: "user-growth",
      higherIsBetter: true,
    },
    {
      key: "success",
      label: "Success rate",
      value: `${data.successRate}%`,
      icon: "check",
      color: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      change: data.comparison.successRate,
      anchor: "provider-performance",
      higherIsBetter: true,
    },
    {
      key: "aov",
      label: "Avg order value",
      value: formatCurrency(data.avgOrderValue),
      icon: "receipt",
      color: "text-neutral-600 dark:text-neutral-300",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      change: data.comparison.avgOrderValue,
      anchor: "revenue-trend",
      higherIsBetter: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const isPositive = card.change >= 0;
        const isGood = card.higherIsBetter ? isPositive : !isPositive;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => card.anchor && onSelect(card.anchor)}
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Card
              className={cn(
                "border-0 shadow-sm transition-shadow hover:shadow-md",
                card.bg
              )}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    {card.label}
                  </p>
                  <AtlasIcon
                    name={card.icon}
                    className={cn("h-5 w-5", card.color)}
                  />
                </div>
                <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {card.value}
                </p>
                <p
                  className={cn(
                    "mt-1 flex items-center gap-1 text-xs",
                    isGood
                      ? "text-success-700 dark:text-success-300"
                      : "text-danger-700 dark:text-danger-300"
                  )}
                >
                  <span aria-hidden="true">
                    {isPositive ? "▲" : "▼"}
                  </span>
                  <span>{Math.abs(card.change).toFixed(1)}%</span>
                  <span className="sr-only">
                    {isPositive ? "increase" : "decrease"} of{" "}
                    {Math.abs(card.change).toFixed(1)} percent
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {COMPARISON_LABEL[range]}
                  </span>
                </p>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}