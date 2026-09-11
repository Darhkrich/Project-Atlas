"use client";

import { useState } from "react";
import { Provider } from "@/lib/admin/types/provider";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";
import Link from "next/link";

interface ProviderHealthAlertProps {
  providers: Provider[];
}

export function ProviderHealthAlert({ providers }: ProviderHealthAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  const unhealthy = providers.filter(
    (p) => p.healthStatus === "warning" || p.healthStatus === "critical"
  );

  if (dismissed) return null;

  if (unhealthy.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-700 dark:border-success-800 dark:bg-success-900/20 dark:text-success-300">
        <AtlasIcon name="check" className="h-4 w-4" />
        All provider connections are operating normally.
      </div>
    );
  }

  const criticalCount = unhealthy.filter(
    (p) => p.healthStatus === "critical"
  ).length;
  const warningCount = unhealthy.filter(
    (p) => p.healthStatus === "warning"
  ).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={criticalCount > 0 ? "danger" : "warning"}>
            {criticalCount > 0 ? "Critical" : "Warning"}
          </Badge>
          <p className="text-sm font-medium">
            {unhealthy.length} provider{unhealthy.length > 1 ? "s" : ""} require
            attention
          </p>
          <span className="text-xs text-neutral-500">
            ({criticalCount} critical · {warningCount} degraded)
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-neutral-500 hover:text-neutral-700"
        >
          Dismiss
        </button>
      </div>

      <div className="space-y-2">
        {unhealthy.map((provider) => {
          const isCritical = provider.healthStatus === "critical";
          const failureRate = (100 - provider.successRate).toFixed(1);
          return (
            <div
              key={provider.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3",
                isCritical
                  ? "border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20"
                  : "border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20"
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isCritical ? "bg-danger-500" : "bg-warning-500"
                    )}
                  />
                  <span className="font-medium">{provider.name}</span>
                  <span className="font-mono text-xs text-neutral-500">
                    {provider.code}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {isCritical
                    ? `Connection failures detected · Failure rate: ${failureRate}%`
                    : `Elevated response time · Current: ${provider.averageResponseTime}ms`}
                </p>
              </div>
              <Link href={`/admin/providers/${provider.id}`}>
                <Button size="sm" variant={isCritical ? "destructive" : "outline"}>
                  {isCritical ? "Investigate" : "View Provider"}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}