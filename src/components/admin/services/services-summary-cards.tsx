"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { ServiceCategory } from "@/lib/services-page-data";

interface ServicesSummaryCardsProps {
  categories: ServiceCategory[];
  onFilterAll?: () => void;
  onFilterAvailable?: () => void;
  onFilterComingSoon?: () => void;
  onFilterInactive?: () => void;
}

export function ServicesSummaryCards({
  categories,
  onFilterAll,
  onFilterAvailable,
  onFilterComingSoon,
  onFilterInactive,
}: ServicesSummaryCardsProps) {
  const total = categories.length;
  const available = categories.filter((c) => c.available).length;
  const comingSoon = categories.filter((c) => c.comingSoon).length;
  const inactive = total - available - comingSoon;

  const cards: {
    label: string;
    value: number;
    sub: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    onClick?: () => void;
  }[] = [
    {
      label: "Total Services",
      value: total,
      sub: "All categories",
      icon: "grid",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
    },
    {
      label: "Available",
      value: available,
      sub: "Live on storefronts",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      onClick: onFilterAvailable,
    },
    {
      label: "Coming Soon",
      value: comingSoon,
      sub: "Announced but hidden",
      icon: "clock",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      onClick: onFilterComingSoon,
    },
    {
      label: "Inactive",
      value: inactive,
      sub: "Disabled",
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