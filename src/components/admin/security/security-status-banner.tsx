// components/admin/security/security-status-banner.tsx
"use client";

import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import type {
  SecurityAlert,
  SecurityStatus,
} from "@/lib/admin/types/security";

interface SecurityStatusBannerProps {
  status: SecurityStatus;
  lastScan: string;
  alerts: SecurityAlert[];
  scanning: boolean;
  onScan: () => void;
}

const config: Record<
  SecurityStatus,
  {
    variant: "success" | "warning" | "danger";
    text: string;
    border: string;
    dot: string;
  }
> = {
  normal: {
    variant: "success",
    text: "All systems normal",
    border:
      "border-success-200 bg-success-50 dark:border-success-800/60 dark:bg-success-900/20",
    dot: "bg-success-500",
  },
  warning: {
    variant: "warning",
    text: "Elevated risk detected",
    border:
      "border-warning-200 bg-warning-50 dark:border-warning-800/60 dark:bg-warning-900/20",
    dot: "bg-warning-500",
  },
  critical: {
    variant: "danger",
    text: "Critical security events",
    border:
      "border-danger-200 bg-danger-50 dark:border-danger-800/60 dark:bg-danger-900/20",
    dot: "bg-danger-500",
  },
};

export function SecurityStatusBanner({
  status,
  lastScan,
  alerts,
  scanning,
  onScan,
}: SecurityStatusBannerProps) {
  const now = useNow();
  const c = config[status];

  const unackCritical = alerts.filter(
    (a) => !a.acknowledged && a.severity === "critical"
  ).length;
  const unackWarning = alerts.filter(
    (a) => !a.acknowledged && a.severity === "warning"
  ).length;

  const reason =
    unackCritical > 0
      ? `${unackCritical} unacknowledged critical alert${unackCritical === 1 ? "" : "s"}`
      : unackWarning > 0
      ? `${unackWarning} unacknowledged alert${unackWarning === 1 ? "" : "s"}`
      : "No unacknowledged alerts.";

  return (
    <div className={cn("rounded-lg border p-4", c.border)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn("mt-1.5 h-3 w-3 shrink-0 rounded-full", c.dot)}
            aria-hidden="true"
          />
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {c.text}
            </p>
            <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
              {reason}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={c.variant}>{status.toUpperCase()}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onScan}
            disabled={scanning}
          >
            {scanning ? "Scanning…" : "Run scan"}
          </Button>
        </div>
      </div>
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        Last security scan:{" "}
        <time dateTime={lastScan} title={formatAbsolute(lastScan)}>
          {formatRelative(lastScan, now)}
        </time>
      </p>
    </div>
  );
}