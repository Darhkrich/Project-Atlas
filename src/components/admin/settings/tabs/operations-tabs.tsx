// components/admin/settings/tabs/operations-tabs.tsx
"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import type {
  AdminRolePermissions,
  HealthStatus,
  SystemHealth,
} from "@/lib/admin/types/settings";

const healthVariant: Record<HealthStatus, "success" | "warning" | "danger"> = {
  operational: "success",
  degraded: "warning",
  down: "danger",
};

const healthLabel: Record<HealthStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  down: "Down",
};

interface HealthTabProps {
  value: SystemHealth;
  refreshing: boolean;
  onRefresh: () => void;
}

export function HealthTab({ value, refreshing, onRefresh }: HealthTabProps) {
  const now = useNow();

  const items: { key: keyof SystemHealth; label: string; status: HealthStatus }[] = [
    { key: "apiStatus", label: "API", status: value.apiStatus },
    {
      key: "databaseStatus",
      label: "Database",
      status: value.databaseStatus,
    },
    { key: "queueStatus", label: "Queue", status: value.queueStatus },
    {
      key: "providerStatus",
      label: "Providers",
      status: value.providerStatus,
    },
  ];

  const overallStatus: HealthStatus = items.some((i) => i.status === "down")
    ? "down"
    : items.some((i) => i.status === "degraded")
    ? "degraded"
    : "operational";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>System health</CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Read-only. Snapshots are captured by the Atlas monitoring agent.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={healthVariant[overallStatus]}>
            {healthLabel[overallStatus]}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div
            key={item.key as string}
            className="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {item.label}
            </span>
            <Badge variant={healthVariant[item.status]}>
              {healthLabel[item.status]}
            </Badge>
          </div>
        ))}

        <p className="pt-2 text-xs text-neutral-500 dark:text-neutral-400">
          Last checked:{" "}
          <time
            dateTime={value.lastChecked}
            title={formatAbsolute(value.lastChecked)}
          >
            {formatRelative(value.lastChecked, now)}
          </time>
        </p>
      </CardContent>
    </Card>
  );
}

interface RolesTabProps {
  value: AdminRolePermissions;
}

export function RolesTab({ value }: RolesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles &amp; permissions</CardTitle>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Read-only for now. Role editing ships with the RBAC system.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {value.roles.map((role) => (
          <div
            key={role.name}
            className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {role.name}
              </p>
              {role.permissions.includes("*") ? (
                <Badge variant="brand" size="sm">
                  Full access
                </Badge>
              ) : (
                <Badge variant="neutral" size="sm">
                  {role.permissions.length} permission
                  {role.permissions.length === 1 ? "" : "s"}
                </Badge>
              )}
            </div>

            {role.permissions.includes("*") ? (
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                Unrestricted access to every part of the admin centre.
              </p>
            ) : (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {role.permissions.map((perm) => (
                  <li
                    key={perm}
                    className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-[11px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {perm}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}