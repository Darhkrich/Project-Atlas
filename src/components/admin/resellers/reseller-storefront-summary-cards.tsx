// components/admin/resellers/reseller-storefront-summary-cards.tsx
"use client";

import type { AtlasIconName } from "@/components/atlas/icons";
import { AtlasIcon } from "@/components/atlas/icons";
import { Card } from "@/components/admin/ui/card";
import { cn } from "@/lib/utils";
import { mockResellerStorefronts } from "@/lib/admin/mock/reseller-storefronts";

interface SummaryCard {
  label: string;
  value: number;
  icon: AtlasIconName;
  color: string;
  bg: string;
}

export function ResellerStorefrontSummaryCards() {
  const total = mockResellerStorefronts.length;
  const live = mockResellerStorefronts.filter(
    (s) => s.status === "live"
  ).length;
  const disabled = mockResellerStorefronts.filter(
    (s) => s.status === "disabled"
  ).length;
  const pending = mockResellerStorefronts.filter(
    (s) => s.status === "pending"
  ).length;
  const totalUsers = mockResellerStorefronts.reduce(
    (sum, s) => sum + s.usersCount,
    0
  );

  const cards: SummaryCard[] = [
    {
      label: "Total Storefronts",
      value: total,
      icon: "store",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
    },
    {
      label: "Live",
      value: live,
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
    },
    {
      label: "Disabled",
      value: disabled,
      icon: "x-circle",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
    },
    {
      label: "Pending Review",
      value: pending,
      icon: "clock",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
    },
    {
      label: "Total Storefront Users",
      value: totalUsers,
      icon: "users",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Reseller storefront summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      {cards.map((card) => (
        <div key={card.label}>
          <Card className={cn("border-0 shadow-sm", card.bg)}>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {card.label}
                </p>
                <AtlasIcon
                  name={card.icon}
                  aria-hidden="true"
                  className={cn("h-5 w-5", card.color)}
                />
              </div>
              <p className="mt-2 text-2xl font-bold">{card.value}</p>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}