"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { Provider } from "@/lib/admin/types/provider";

interface ProvidersSummaryProps {
  providers: Provider[];
  onFilterAll?: () => void;
  onFilterActive?: () => void;
  onFilterDegraded?: () => void;
  onFilterOffline?: () => void;
}

export function ProvidersSummary({
  providers,
  onFilterAll,
  onFilterActive,
  onFilterDegraded,
  onFilterOffline,
}: ProvidersSummaryProps) {
  const total = providers.length;
  const active = providers.filter((p) => p.status === "active").length;
  const degraded = providers.filter((p) => p.status === "degraded").length;
  const offline = providers.filter((p) => p.status === "offline").length;
  const servicesCovered = new Set(
    providers.flatMap((p) => p.services.map((s) => s.serviceCategory))
  ).size;

  const cards: {
    label: string;
    value: number | string;
    sub: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    highlight?: boolean;
    onClick?: () => void;
  }[] = [
    {
      label: "Total Providers",
      value: total,
      sub: `${servicesCovered} services covered`,
      icon: "server",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
    },
    {
      label: "Active",
      value: active,
      sub: "Operational",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      onClick: onFilterActive,
    },
    {
      label: "Degraded",
      value: degraded,
      sub: "Needs attention",
      icon: "alert",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: degraded > 0,
      onClick: onFilterDegraded,
    },
    {
      label: "Offline",
      value: offline,
      sub: "Unreachable",
      icon: "x-circle",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      highlight: offline > 0,
      onClick: onFilterOffline,
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
            card.highlight && "ring-1 ring-danger-300 dark:ring-danger-800",
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