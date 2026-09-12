"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { DataNetwork } from "@/lib/admin/types/data-plan";
import { marginBandFor } from "@/lib/admin/data-plans/helpers";
import { planStatus } from "@/lib/admin/data-plans/constants";

export type SummaryFilter = "all" | "low-margin" | "inactive";

interface DataPlanSummaryCardsProps {
  networks: DataNetwork[];
  activeFilter: SummaryFilter;
  onFilterAll: () => void;
  onFilterLowMargin: () => void;
  onFilterInactive: () => void;
}

export function DataPlanSummaryCards({
  networks,
  activeFilter,
  onFilterAll,
  onFilterLowMargin,
  onFilterInactive,
}: DataPlanSummaryCardsProps) {
  const totalNetworks = networks.length;
  const totalCategories = networks.reduce(
    (sum, n) => sum + n.categories.length,
    0
  );
  const allPlans = networks.flatMap((n) =>
    n.categories.flatMap((c) => c.plans)
  );
  const totalPlans = allPlans.length;
  const activePlans = allPlans.filter(
    (p) => planStatus(p.active) === "active"
  ).length;
  const inactivePlans = totalPlans - activePlans;

  const lowMarginCount = allPlans.filter((p) => {
    const band = marginBandFor(p);
    return band === "tight" || band === "critical";
  }).length;

  interface CardDef {
    key: SummaryFilter | "networks";
    label: string;
    value: number;
    sub: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    highlight?: boolean;
    onClick?: () => void;
    pressed?: boolean;
    interactive: boolean;
  }

  const cards: CardDef[] = [
    {
      key: "networks",
      label: "Networks",
      value: totalNetworks,
      sub: `${totalCategories} categories`,
      icon: "globe",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      interactive: false,
    },
    {
      key: "all",
      label: "Total plans",
      value: totalPlans,
      sub: `${activePlans} active`,
      icon: "wifi",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      onClick: onFilterAll,
      pressed: activeFilter === "all",
      interactive: true,
    },
    {
      key: "low-margin",
      label: "Low margin",
      value: lowMarginCount,
      sub: "Tight or critical",
      icon: "alert",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: lowMarginCount > 0,
      onClick: onFilterLowMargin,
      pressed: activeFilter === "low-margin",
      interactive: true,
    },
    {
      key: "inactive",
      label: "Inactive plans",
      value: inactivePlans,
      sub: "Disabled for purchase",
      icon: "x-circle",
      color: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      onClick: onFilterInactive,
      pressed: activeFilter === "inactive",
      interactive: true,
    },
  ];

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      role="region"
      aria-label="Data plan summary"
    >
      {cards.map((card) => {
        const inner = (
          <Card
            className={cn(
              "h-full border-0 shadow-sm transition-all",
              card.bg,
              card.highlight &&
                "ring-1 ring-warning-300 dark:ring-warning-800",
              card.interactive && "hover:shadow-md",
              card.pressed &&
                "ring-2 ring-brand-400 dark:ring-brand-500"
            )}
          >
            <div className="p-4 text-left">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {card.label}
                </p>
                <AtlasIcon
                  name={card.icon}
                  aria-hidden="true"
                  className={cn("h-4 w-4", card.color)}
                />
              </div>
              <p className="mt-2 text-2xl font-bold" aria-live="polite">
                {card.value}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {card.sub}
              </p>
            </div>
          </Card>
        );

        if (!card.interactive || !card.onClick) {
          return <div key={card.key}>{inner}</div>;
        }

        return (
          <button
            key={card.key}
            type="button"
            onClick={card.onClick}
            aria-pressed={card.pressed ?? false}
            className="rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}