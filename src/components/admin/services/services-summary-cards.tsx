// components/admin/services/services-summary-cards.tsx
"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { ServiceCategory } from "@/lib/services-page-data";
import {
  isAvailable,
  isComingSoon,
  isInactive,
} from "@/lib/admin/services/helpers";

export interface ServicesSummaryData {
  total: number;
  available: number;
  comingSoon: number;
  inactive: number;
}

interface ServicesSummaryCardsProps {
  categories: ServiceCategory[];
  activeStatus: string;
  onFilterAll: () => void;
  onFilterAvailable: () => void;
  onFilterComingSoon: () => void;
  onFilterInactive: () => void;
}

interface CardConfig {
  key: string;
  label: string;
  value: number;
  sub: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  isActive: boolean;
  onClick: () => void;
}

export function ServicesSummaryCards({
  categories,
  activeStatus,
  onFilterAll,
  onFilterAvailable,
  onFilterComingSoon,
  onFilterInactive,
}: ServicesSummaryCardsProps) {
  const total = categories.length;
  const available = categories.filter(isAvailable).length;
  const comingSoon = categories.filter(isComingSoon).length;
  const inactive = categories.filter(isInactive).length;

  const cards: CardConfig[] = [
    {
      key: "total",
      label: "Total services",
      value: total,
      sub: "All categories",
      icon: "grid",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      isActive: activeStatus === "",
      onClick: onFilterAll,
    },
    {
      key: "available",
      label: "Available",
      value: available,
      sub: "Live on storefronts",
      icon: "check-circle",
      color: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-success-900/20",
      isActive: activeStatus === "available",
      onClick: onFilterAvailable,
    },
    {
      key: "coming_soon",
      label: "Coming soon",
      value: comingSoon,
      sub: "Announced but hidden",
      icon: "clock",
      color: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      isActive: activeStatus === "coming_soon",
      onClick: onFilterComingSoon,
    },
    {
      key: "inactive",
      label: "Inactive",
      value: inactive,
      sub: "Disabled",
      icon: "x-circle",
      color: "text-neutral-600 dark:text-neutral-300",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      isActive: activeStatus === "inactive",
      onClick: onFilterInactive,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          aria-pressed={card.isActive}
          onClick={card.onClick}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <div
            className={cn(
              "rounded-lg border-0 p-4 shadow-sm transition-shadow hover:shadow-md",
              card.bg,
              card.isActive && "ring-2 ring-brand-500"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                {card.label}
              </p>
              <AtlasIcon
                name={card.icon}
                className={cn("h-4 w-4", card.color)}
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {card.value}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {card.sub}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}