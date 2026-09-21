"use client";

import type { StorefrontSummary } from "@/lib/admin/storefronts/storefront-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/admin/formatters";

export type StorefrontTypeFilter = "all" | "reseller" | "merchant";
export type StorefrontStatusFilter = "all" | "disabled";

interface StorefrontSummaryCardsProps {
  summary: StorefrontSummary;
  activeType: StorefrontTypeFilter;
  activeStatus: StorefrontStatusFilter;
  loading?: boolean;
  onFilterAll: () => void;
  onFilterReseller: () => void;
  onFilterMerchant: () => void;
  onFilterDisabled: () => void;
}

interface CardDef {
  key: string;
  label: string;
  value: string;
  sub?: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  onClick: () => void;
  pressed: boolean;
  ariaLabel: string;
}

export function StorefrontSummaryCards({
  summary,
  activeType,
  activeStatus,
  loading,
  onFilterAll,
  onFilterReseller,
  onFilterMerchant,
  onFilterDisabled,
}: StorefrontSummaryCardsProps) {
  const cards: CardDef[] = [
    {
      key: "all",
      label: "Total storefronts",
      value: formatNumber(summary.total),
      sub:
        summary.liveCount +
        " live · " +
        summary.pendingCount +
        " pending · " +
        summary.disabledCount +
        " disabled",
      icon: "store",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
      pressed: activeType === "all" && activeStatus === "all",
      ariaLabel: summary.total + " total storefronts",
    },
    {
      key: "reseller",
      label: "Reseller storefronts",
      value: formatNumber(summary.resellerCount),
      sub: "Digital services",
      icon: "users",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      onClick: onFilterReseller,
      pressed: activeType === "reseller",
      ariaLabel: summary.resellerCount + " reseller storefronts",
    },
    {
      key: "merchant",
      label: "Merchant storefronts",
      value: formatNumber(summary.merchantCount),
      sub: "E-commerce",
      icon: "briefcase",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      onClick: onFilterMerchant,
      pressed: activeType === "merchant",
      ariaLabel: summary.merchantCount + " merchant storefronts",
    },
    {
      key: "disabled",
      label: "Disabled",
      value: formatNumber(summary.disabledCount),
      sub: "Offline storefronts",
      icon: "x-circle",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      onClick: onFilterDisabled,
      pressed: activeStatus === "disabled",
      ariaLabel: summary.disabledCount + " disabled storefronts",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Storefront summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={card.onClick}
          aria-pressed={card.pressed}
          aria-label={card.ariaLabel}
          className="rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Card
            className={cn(
              "h-full border-0 shadow-sm transition-all hover:shadow-md",
              card.bg,
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
        </button>
      ))}
    </div>
  );
}