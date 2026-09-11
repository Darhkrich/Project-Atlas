"use client";

import { AdminUser, ADMIN_ROLES } from "@/lib/admin/types/admin-user";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface AdminUserCardProps {
  user: AdminUser;
  isSelected: boolean;
  onClick: (user: AdminUser) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(date: string | null) {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const roleBadgeVariant: Record<string, "brand" | "info" | "warning" | "success" | "danger" | "neutral"> = {
  super_admin: "brand",
  operations_admin: "info",
  finance_admin: "warning",
  support_admin: "success",
  service_admin: "neutral",
  analyst: "neutral",
};

export function AdminUserCard({ user, isSelected, onClick }: AdminUserCardProps) {
  const roleLabel =
    ADMIN_ROLES.find((r) => r.value === user.role)?.label || user.role;

  const statusVariant = user.status === "active" ? "success" : "danger";

  const recentActivity =
    user.activityLog.length > 0
      ? new Date(user.activityLog[0].timestamp)
      : null;

  return (
    <button
      onClick={() => onClick(user)}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
        isSelected
          ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500 dark:bg-brand-900/20"
          : "border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
          {getInitials(user.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="truncate text-xs text-neutral-500">
                {user.email}
              </p>
            </div>
            <Badge variant={statusVariant}>{user.status}</Badge>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={roleBadgeVariant[user.role]}>{roleLabel}</Badge>
          </div>

          {/* Meta row */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-neutral-500">Last Login</p>
              <p className="font-medium">{timeAgo(user.lastLogin)}</p>
            </div>
            <div>
              <p className="text-neutral-500">Permissions</p>
              <p className="font-medium">{user.permissions.length}</p>
            </div>
          </div>

          {/* Recent activity preview */}
          {recentActivity && (
            <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
              <AtlasIcon name="clock" className="h-3 w-3" />
              {user.activityLog[0].action} · {timeAgo(user.activityLog[0].timestamp)}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}