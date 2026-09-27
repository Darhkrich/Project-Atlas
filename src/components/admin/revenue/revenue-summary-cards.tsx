"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";
import type { RevenueKpis } from "@/lib/admin/revenue/revenue-projection";

interface CardDef {
  key: string;
  label: string;
  value: number;
  delta: number | null;
  icon: AtlasIconName;
  toneClass: string;
}

export function RevenueSummaryCards({ kpis }: { kpis: RevenueKpis }) {
  const cards: CardDef[] = [
    {
      key: "total",
      label: "Total platform revenue",
      value: kpis.totalPlatform,
      delta: kpis.deltas.total,
      icon: "sales",
      toneClass: "text-brand-600 dark:text-brand-400",
    },
    {
      key: "today",
      label: "Today",
      value: kpis.todayPlatform,
      delta: kpis.deltas.today,
      icon: "trending-up",
      toneClass: "text-info-600 dark:text-info-400",
    },
    {
      key: "month",
      label: "This month",
      value: kpis.monthPlatform,
      delta: kpis.deltas.month,
      icon: "calendar",
      toneClass: "text-warning-600 dark:text-warning-400",
    },
    {
      key: "year",
      label: "This year",
      value: kpis.yearPlatform,
      delta: kpis.deltas.year,
      icon: "bar-chart",
      toneClass: "text-success-600 dark:text-success-400",
    },
    {
      key: "avg",
      label: "Average daily",
      value: kpis.avgDailyPlatform,
      delta: kpis.deltas.avgDaily,
      icon: "record",
      toneClass: "text-neutral-600 dark:text-neutral-400",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Revenue summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      {cards.map((card) => (
        <Card key={card.key}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {card.label}
              </p>
              <AtlasIcon
                name={card.icon}
                aria-hidden="true"
                className={cn("h-4 w-4", card.toneClass)}
              />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {formatCurrency(card.value)}
            </p>
            {card.delta !== null && (
              <p
                className={cn(
                  "mt-1 text-xs font-medium",
                  card.delta >= 0
                    ? "text-success-700 dark:text-success-400"
                    : "text-danger-700 dark:text-danger-400"
                )}
              >
                <span aria-hidden="true">
                  {card.delta >= 0 ? "▲" : "▼"}{" "}
                </span>
                {Math.abs(card.delta).toFixed(1)}% vs prev
              </p>
            )}
            {card.delta === null && (
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                No prior data
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}