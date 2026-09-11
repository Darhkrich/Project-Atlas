/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Card } from "@/components/admin/ui/card";
import { formatCurrency } from "@/lib/admin/formatters";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { mockServicePricing } from "@/lib/admin/mock/pricing";

interface PricingSummaryCardsProps {
  onFilterLowMargin?: () => void;
  onFilterInactive?: () => void;
  onFilterAll?: () => void;
}

export function PricingSummaryCards({
  onFilterLowMargin,
  onFilterInactive,
  onFilterAll,
}: PricingSummaryCardsProps) {
  const totalServices = mockServicePricing.length;
  const activeServices = mockServicePricing.filter((s) => s.status === "active").length;
  const avgMargin =
    mockServicePricing.reduce(
      (sum, s) =>
        sum + ((s.atlasPrice - s.providerCost) / s.atlasPrice) * 100,
      0
    ) / Math.max(totalServices, 1);
  const lowMargin = mockServicePricing.filter(
    (s) => ((s.atlasPrice - s.providerCost) / s.atlasPrice) * 100 < 10
  ).length;

  const cards: {
    label: string;
    value: string | number;
    sub?: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    highlight?: boolean;
    onClick?: () => void;
  }[] = [
    {
      label: "Total Services",
      value: totalServices,
      sub: `${activeServices} active`,
      icon: "grid",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
    },
    {
      label: "Average Margin",
      value: `${avgMargin.toFixed(1)}%`,
      sub: "Across all services",
      icon: "percent",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
    },
    {
      label: "Low Margin Alerts",
      value: lowMargin,
      sub: "Below 10% margin",
      icon: "alert",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: lowMargin > 0,
      onClick: onFilterLowMargin,
    },
    {
      label: "Inactive Services",
      value: totalServices - activeServices,
      sub: "Not currently available",
      icon: "x-circle",
      color: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      onClick: onFilterInactive,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            {card.sub && <p className="text-xs text-neutral-500">{card.sub}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}