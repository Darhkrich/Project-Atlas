// components/admin/admin-users/admin-user-card.tsx
"use client";

import { Badge } from "@/components/admin/ui/badge";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import type { AdminUser } from "@/lib/admin/types/admin-user";
import type { SupportUserType } from "@/lib/admin/types/support";
import {
  effectivePermissions,
  roleLabel,
} from "@/lib/admin/rbac";
import {
  STATUS_LABEL,
  STATUS_VARIANT,
  ROLE_VARIANT,
  initialsFor,
} from "@/lib/admin/admin-users/constants";
import { countModules } from "@/lib/admin/admin-users/permissions";

interface AdminUserCardProps {
  user: AdminUser;
  isSelected: boolean;
  isFocused: boolean;
  twoFactorEnabled: boolean;
  queueNames: string[];
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onFocus: (id: string) => void;
}

const USER_TYPE_LABEL: Record<SupportUserType, string> = {
  customer: "Customer",
  reseller: "Reseller",
  merchant: "Merchant",
};

export function AdminUserCard({
  user,
  isSelected,
  isFocused,
  twoFactorEnabled,
  queueNames,
  onToggleSelect,
  onOpen,
  onFocus,
}: AdminUserCardProps) {
  const now = useNow();
  const isPending = user.status === "pending";
  const effective = effectivePermissions({
    role: user.role,
    extraPermissions: user.extraPermissions,
  });
  const permissionCount = effective.length;
  const moduleCount = countModules(effective);
  const checkboxId = `admin-user-select-${user.id}`;

  const toneFromStatus =
    user.status === "active"
      ? "success"
      : user.status === "suspended"
      ? "danger"
      : "warning";

  return (
    <div
      data-admin-user-id={user.id}
      onMouseEnter={() => onFocus(user.id)}
      className={cn(
        "relative rounded-xl border bg-white transition-all dark:bg-neutral-900",
        "border-neutral-200 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-700",
        isSelected &&
          "border-brand-500 ring-2 ring-brand-500 dark:bg-brand-900/20",
        isFocused && !isSelected && "ring-1 ring-brand-300 dark:ring-brand-800"
      )}
    >
      <label
        htmlFor={checkboxId}
        className="absolute left-3 top-3 z-10 flex h-4 w-4 cursor-pointer items-center justify-center"
        aria-label={`Select ${user.name}`}
      >
        <input
          id={checkboxId}
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(user.id)}
          className="h-4 w-4"
        />
      </label>

      <button
        type="button"
        onClick={() => onOpen(user.id)}
        className="w-full rounded-xl p-4 pl-10 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            {initialsFor(user.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {user.name}
                </p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {user.email}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <StatusDot tone={toneFromStatus} size="sm" />
                <Badge variant={STATUS_VARIANT[user.status]} size="sm">
                  {STATUS_LABEL[user.status]}
                </Badge>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge variant={ROLE_VARIANT[user.role]} size="sm">
                {roleLabel(user.role)}
              </Badge>
              {user.extraPermissions.length > 0 && (
                <Badge variant="neutral" size="sm">
                  +{user.extraPermissions.length} extra
                </Badge>
              )}
              {twoFactorEnabled ? (
                <Badge variant="success" size="sm">
                  2FA on
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  2FA missing
                </Badge>
              )}
            </div>

            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {permissionCount} permissions across {moduleCount} modules
            </p>

            {queueNames.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {queueNames.map((name) => (
                  <span
                    key={name}
                    className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            {user.handles.length > 0 && (
              <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                Handles{" "}
                {user.handles.map((h) => USER_TYPE_LABEL[h]).join(", ")}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Last login
                </p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">
                  {user.lastLogin ? (
                    <time
                      dateTime={user.lastLogin}
                      title={formatAbsolute(user.lastLogin)}
                    >
                      {formatRelative(user.lastLogin, now)}
                    </time>
                  ) : (
                    "Never"
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-neutral-500 dark:text-neutral-400">
                  Permissions
                </p>
                <p className="font-medium text-neutral-800 dark:text-neutral-200">
                  {permissionCount}
                </p>
              </div>
            </div>

            {isPending && user.invitedAt && (
              <p className="mt-2 flex items-center gap-1 text-xs text-warning-700 dark:text-warning-300">
                <AtlasIcon name="clock" className="h-3 w-3" />
                Invited{" "}
                <time
                  dateTime={user.invitedAt}
                  title={formatAbsolute(user.invitedAt)}
                >
                  {formatRelative(user.invitedAt, now)}
                </time>
              </p>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}