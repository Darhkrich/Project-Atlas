"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { Customer } from "@/lib/admin/types/customer";

interface StorefrontUserSummaryCardsProps {
  users: Customer[];
  storefrontCount: number;
  onFilterAll?: () => void;
  onFilterActive?: () => void;
  onFilterSuspended?: () => void;
  onFilterHighRisk?: () => void;
}

export function StorefrontUserSummaryCards({
  users,
  storefrontCount,
  onFilterAll,
  onFilterActive,
  onFilterSuspended,
  onFilterHighRisk,
}: StorefrontUserSummaryCardsProps) {
  const total = users.length;
  const active = users.filter((u) => u.status === "active").length;
  const suspended = users.filter((u) => u.status === "suspended").length;
  const highRisk = users.filter((u) => u.riskLevel === "high").length;
  const totalSpent = users.reduce((sum, u) => sum + u.totalSpent, 0);

  const cards: {
    label: string;
    value: string | number;
    sub: string;
    icon: AtlasIconName;
    color: string;
    bg: string;
    highlight?: boolean;
    onClick?: () => void;
  }[] = [
    {
      label: "Total Users",
      value: total,
      sub: `${storefrontCount} storefronts`,
      icon: "users",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
    },
    {
      label: "Active",
      value: active,
      sub: "Engaged users",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      onClick: onFilterActive,
    },
    {
      label: "Suspended",
      value: suspended,
      sub: "Restricted access",
      icon: "x-circle",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      highlight: suspended > 0,
      onClick: onFilterSuspended,
    },
    {
      label: "High Risk",
      value: highRisk,
      sub: `${formatCurrency(totalSpent)} total spent`,
      icon: "alert",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: highRisk > 0,
      onClick: onFilterHighRisk,
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