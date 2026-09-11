"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { AdminUser } from "@/lib/admin/types/admin-user";

interface AdminUserSummaryCardsProps {
  users: AdminUser[];
  onFilterAll?: () => void;
  onFilterActive?: () => void;
  onFilterSuspended?: () => void;
  onFilterSuperAdmin?: () => void;
}

export function AdminUserSummaryCards({
  users,
  onFilterAll,
  onFilterActive,
  onFilterSuspended,
  onFilterSuperAdmin,
}: AdminUserSummaryCardsProps) {
  const total = users.length;
  const active = users.filter((u) => u.status === "active").length;
  const suspended = users.filter((u) => u.status === "suspended").length;
  const superAdmins = users.filter((u) => u.role === "super_admin").length;
  const rolesCount = new Set(users.map((u) => u.role)).size;

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
      label: "Total Admins",
      value: total,
      sub: `${rolesCount} roles`,
      icon: "shield",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
    },
    {
      label: "Active",
      value: active,
      sub: "Currently active",
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
      label: "Super Admins",
      value: superAdmins,
      sub: "Full access",
      icon: "star",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      onClick: onFilterSuperAdmin,
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