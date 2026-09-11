"use client";

import { mockSecuritySummary } from "@/lib/admin/mock/security";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy}, ${hh}:${min}:${ss}`;
}

export function SecurityStatusBanner() {
  const status = mockSecuritySummary.status;

  const config = {
    normal: {
      variant: "success" as const,
      text: "All systems normal",
      border: "border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20",
    },
    warning: {
      variant: "warning" as const,
      text: "Elevated risk detected",
      border: "border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20",
    },
    critical: {
      variant: "danger" as const,
      text: "Critical security events",
      border: "border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20",
    },
  }[status];

  return (
    <div className={cn("rounded-lg border p-4", config.border)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("h-3 w-3 rounded-full", status === "normal" ? "bg-success-500" : status === "warning" ? "bg-warning-500" : "bg-danger-500")} />
          <p className="font-medium">{config.text}</p>
        </div>
        <Badge variant={config.variant}>{status.toUpperCase()}</Badge>
      </div>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Last security scan: {formatTimestamp(mockSecuritySummary.lastSecurityScan)}
      </p>
    </div>
  );
}