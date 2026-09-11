"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { DataNetwork } from "@/lib/admin/types/data-plan";

interface DataPlanSummaryCardsProps {
  networks: DataNetwork[];
  onFilterAll?: () => void;
  onFilterLowMargin?: () => void;
  onFilterInactive?: () => void;
}

export function DataPlanSummaryCards({
  networks,
  onFilterAll,
  onFilterLowMargin,
  onFilterInactive,
}: DataPlanSummaryCardsProps) {
  const totalNetworks = networks.length;
  const totalCategories = networks.reduce((sum, n) => sum + n.categories.length, 0);
  const allPlans = networks.flatMap((n) => n.categories.flatMap((c) => c.plans));
  const totalPlans = allPlans.length;
  const activePlans = allPlans.filter((p) => p.active).length;
  const inactivePlans = totalPlans - activePlans;

  const lowMarginCount = allPlans.filter((p) => {
    if (!p.providerCost || p.price === 0) return false;
    return ((p.price - p.providerCost) / p.price) * 100 < 10;
  }).length;

  const cards: {
    label: string;
    value: number;
    sub: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    highlight?: boolean;
    onClick?: () => void;
  }[] = [
    {
      label: "Networks",
      value: totalNetworks,
      sub: `${totalCategories} categories`,
      icon: "globe",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
    },
    {
      label: "Total Plans",
      value: totalPlans,
      sub: `${activePlans} active`,
      icon: "wifi",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      onClick: onFilterAll,
    },
    {
      label: "Low Margin",
      value: lowMarginCount,
      sub: "Below 10% margin",
      icon: "alert",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: lowMarginCount > 0,
      onClick: onFilterLowMargin,
    },
    {
      label: "Inactive Plans",
      value: inactivePlans,
      sub: "Disabled for purchase",
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
            <p className="text-xs text-neutral-500">{card.sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}