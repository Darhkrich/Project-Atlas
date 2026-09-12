// components/admin/admin-users/admin-user-summary-cards.tsx
"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/lib/admin/types/admin-user";

interface AdminUserSummaryCardsProps {
  users: AdminUser[];
  activeStatus: string;
  activeRole: string;
  onSelectStatus: (status: string) => void;
  onSelectRole: (role: string) => void;
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
  highlight?: boolean;
  onClick: () => void;
}

export function AdminUserSummaryCards({
  users,
  activeStatus,
  activeRole,
  onSelectStatus,
  onSelectRole,
}: AdminUserSummaryCardsProps) {
  const total = users.length;
  const active = users.filter((u) => u.status === "active").length;
  const pending = users.filter((u) => u.status === "pending").length;
  const suspended = users.filter((u) => u.status === "suspended").length;
  const superAdmins = users.filter((u) => u.role === "super_admin").length;
  const rolesCount = new Set(users.map((u) => u.role)).size;

  const cards: CardConfig[] = [
    {
      key: "total",
      label: "Total admins",
      value: total,
      sub: `${rolesCount} roles`,
      icon: "shield",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      isActive: activeStatus === "" && activeRole === "",
      onClick: () => {
        onSelectStatus("");
        onSelectRole("");
      },
    },
    {
      key: "active",
      label: "Active",
      value: active,
      sub: "Verified and signed in",
      icon: "check-circle",
      color: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-success-900/20",
      isActive: activeStatus === "active",
      onClick: () =>
        onSelectStatus(activeStatus === "active" ? "" : "active"),
    },
    {
      key: "pending",
      label: "Pending",
      value: pending,
      sub: "Awaiting verification",
      icon: "clock",
      color: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      isActive: activeStatus === "pending",
      highlight: pending > 0,
      onClick: () =>
        onSelectStatus(activeStatus === "pending" ? "" : "pending"),
    },
    {
      key: "suspended",
      label: "Suspended",
      value: suspended,
      sub: "Access revoked",
      icon: "x-circle",
      color: "text-danger-600 dark:text-danger-400",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      isActive: activeStatus === "suspended",
      highlight: suspended > 0,
      onClick: () =>
        onSelectStatus(activeStatus === "suspended" ? "" : "suspended"),
    },
    {
      key: "super",
      label: "Super admins",
      value: superAdmins,
      sub: "Full access",
      icon: "star",
      color: "text-info-600 dark:text-info-400",
      bg: "bg-info-50 dark:bg-info-900/20",
      isActive: activeRole === "super_admin",
      onClick: () =>
        onSelectRole(activeRole === "super_admin" ? "" : "super_admin"),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              card.isActive && "ring-2 ring-brand-500",
              card.highlight &&
                !card.isActive &&
                "ring-1 ring-danger-300 dark:ring-danger-800"
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