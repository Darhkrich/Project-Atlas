"use client";

import { Card } from "@/components/admin/ui/card";
import { formatCurrency } from "@/lib/admin/formatters";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/admin/ui/button";

interface RevenueSummaryData {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  avgDailyRevenue: number;
  comparison: {
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    yearRevenue: number;
    avgDailyRevenue: number;
  };
}

type Range = "today" | "7d" | "30d" | "90d" | "12m";

interface RevenueSummaryCardsProps {
  data: RevenueSummaryData;
  range: Range;
  onRangeChange: (range: Range) => void;
}

const ranges: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "12m", label: "12m" },
];

export function RevenueSummaryCards({ data, range, onRangeChange }: RevenueSummaryCardsProps) {
  const cards: {
    label: string;
    value: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    change: number;
  }[] = [
    {
      label: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: "sales",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      change: data.comparison.totalRevenue,
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(data.todayRevenue),
      icon: "trending-up",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      change: data.comparison.todayRevenue,
    },
    {
      label: "This Month",
      value: formatCurrency(data.monthRevenue),
      icon: "calendar",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      change: data.comparison.monthRevenue,
    },
    {
      label: "This Year",
      value: formatCurrency(data.yearRevenue),
      icon: "bar-chart",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      change: data.comparison.yearRevenue,
    },
    {
      label: "Avg Daily",
      value: formatCurrency(data.avgDailyRevenue),
      icon: "record",
      color: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      change: data.comparison.avgDailyRevenue,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Range selector */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-xs font-medium text-neutral-500">Range:</span>
        {ranges.map((r) => (
          <Button
            key={r.key}
            variant="ghost"
            size="sm"
            className={cn(
              "text-xs",
              range === r.key &&
                "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            )}
            onClick={() => onRangeChange(r.key)}
          >
            {r.label}
          </Button>
        ))}
      </div>

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
              <p
                className={cn(
                  "mt-1 text-xs",
                  card.change >= 0 ? "text-success-600" : "text-danger-600"
                )}
              >
                {card.change >= 0 ? "▲" : "▼"} {Math.abs(card.change)}% vs prev
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}