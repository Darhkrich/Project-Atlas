"use client";

import type { TierSummary } from "@/lib/admin/resellers/tier-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/admin/formatters";

interface TierSummaryCardsProps {
  summary: TierSummary;
  loading?: boolean;
}

interface CardDef {
  key: string;
  label: string;
  value: string;
  sub?: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  ariaLabel: string;
}

export function TierSummaryCards({ summary, loading }: TierSummaryCardsProps) {
  const extraCutValue =
    summary.tierCount === 0
      ? "—"
      : summary.extraCutRange.min === summary.extraCutRange.max
      ? `${summary.extraCutRange.min}%`
      : `${summary.extraCutRange.min}–${summary.extraCutRange.max}%`;

  const airtimeRateValue =
    summary.tierCount === 0
      ? "—"
      : summary.airtimeRateRange.min === summary.airtimeRateRange.max
      ? `${summary.airtimeRateRange.min}%`
      : `${summary.airtimeRateRange.min}–${summary.airtimeRateRange.max}%`;

  const cards: CardDef[] = [
    {
      key: "tiers",
      label: "Tiers",
      value: formatNumber(summary.tierCount),
      sub: "Active policies",
      icon: "star",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      ariaLabel: `${summary.tierCount} tiers`,
    },
    {
      key: "assigned",
      label: "Resellers assigned",
      value: `${summary.assignedResellers} / ${summary.totalResellers}`,
      sub:
        summary.assignedResellers === summary.totalResellers
          ? "Every reseller is on a tier"
          : `${summary.totalResellers - summary.assignedResellers} unassigned`,
      icon: "users",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      ariaLabel: `${summary.assignedResellers} of ${summary.totalResellers} resellers assigned to a tier`,
    },
    {
      key: "extra-cut",
      label: "Extra cut range",
      value: extraCutValue,
      sub: "Atlas share of markup",
      icon: "percent",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      ariaLabel: `Extra cut ranges from ${summary.extraCutRange.min} to ${summary.extraCutRange.max} percent`,
    },
    {
      key: "airtime-rate",
      label: "Airtime rate range",
      value: airtimeRateValue,
      sub: "Base rate, low to high tier",
      icon: "wifi",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      ariaLabel: `Airtime commission rate ranges from ${summary.airtimeRateRange.min} to ${summary.airtimeRateRange.max} percent`,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Tier summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          className={cn("h-full border-0 shadow-sm", card.bg)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {card.label}
              </p>
              <AtlasIcon
                name={card.icon}
                aria-hidden="true"
                className={cn("h-4 w-4 shrink-0", card.color)}
              />
            </div>
            <p className="mt-2 text-2xl font-bold" aria-live="polite">
              {loading ? (
                <span
                  aria-hidden="true"
                  className="inline-block h-6 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
                />
              ) : (
                card.value
              )}
            </p>
            {card.sub && (
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {card.sub}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}