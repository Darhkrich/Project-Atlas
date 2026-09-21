"use client";

import type { PromotionSummary } from "@/lib/admin/resellers/promotion-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/admin/formatters";

interface PromotionSummaryCardsProps {
  summary: PromotionSummary;
  loading?: boolean;
  activeFilter?: "all" | "active" | "scheduled" | "expiring";
  onFilterAll?: () => void;
  onFilterActive?: () => void;
  onFilterScheduled?: () => void;
  onFilterExpiring?: () => void;
}

interface CardDef {
  key: string;
  label: string;
  value: string;
  sub?: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  highlight?: "warning";
  onClick?: () => void;
  pressed?: boolean;
  interactive: boolean;
  ariaLabel: string;
}

export function PromotionSummaryCards({
  summary,
  loading,
  activeFilter,
  onFilterAll,
  onFilterActive,
  onFilterScheduled,
  onFilterExpiring,
}: PromotionSummaryCardsProps) {
  const cards: CardDef[] = [
    {
      key: "all",
      label: "Total promotions",
      value: formatNumber(summary.total),
      sub: summary.expired + summary.ended + " closed",
      icon: "gift",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
      pressed: activeFilter === "all",
      interactive: Boolean(onFilterAll),
      ariaLabel: summary.total + " total promotions",
    },
    {
      key: "active",
      label: "Active",
      value: formatNumber(summary.active),
      sub: summary.active === 0 ? "Nothing running" : "Running now",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      onClick: onFilterActive,
      pressed: activeFilter === "active",
      interactive: Boolean(onFilterActive),
      ariaLabel: summary.active + " active promotions",
    },
    {
      key: "scheduled",
      label: "Scheduled",
      value: formatNumber(summary.scheduled),
      sub: summary.scheduled === 0 ? "Nothing queued" : "Starting in the future",
      icon: "clock",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      onClick: onFilterScheduled,
      pressed: activeFilter === "scheduled",
      interactive: Boolean(onFilterScheduled),
      ariaLabel: summary.scheduled + " scheduled promotions",
    },
    {
      key: "expiring",
      label: "Expiring soon",
      value: formatNumber(summary.expiringSoon),
      sub: "Within the next 7 days",
      icon: "alert",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: summary.expiringSoon > 0 ? "warning" : undefined,
      onClick: onFilterExpiring,
      pressed: activeFilter === "expiring",
      interactive: Boolean(onFilterExpiring),
      ariaLabel: summary.expiringSoon + " promotions expiring within 7 days",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Promotion summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => {
        const inner = (
          <Card
            className={cn(
              "h-full border-0 shadow-sm transition-all",
              card.bg,
              card.highlight === "warning" &&
                "ring-1 ring-warning-300 dark:ring-warning-800",
              card.interactive && "hover:shadow-md",
              card.pressed &&
                "ring-2 ring-brand-400 dark:ring-brand-500"
            )}
          >
            <div className="p-4 text-left">
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
                    className="inline-block h-6 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
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
            aria-label={card.ariaLabel}
            className="rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}