"use client";

import Link from "next/link";
import type { Provider } from "@/lib/admin/types/provider";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { providerOperationalState } from "@/lib/admin/providers/state";

interface ProviderHealthAlertProps {
  providers: Provider[];
}

export function ProviderHealthAlert({ providers }: ProviderHealthAlertProps) {
  const atRisk = providers
    .map((p) => ({ provider: p, state: providerOperationalState(p) }))
    .filter((x) => x.state.kind === "impaired" || x.state.kind === "down");

  if (atRisk.length === 0) {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-lg border border-success-200 bg-success-50 p-3 text-sm text-success-700 dark:border-success-800 dark:bg-success-900/20 dark:text-success-300"
      >
        <AtlasIcon name="check" aria-hidden="true" className="h-4 w-4" />
        No provider health issues detected.
      </div>
    );
  }

  const criticalCount = atRisk.filter((x) => x.state.kind === "down").length;
  const warningCount = atRisk.length - criticalCount;

  return (
    <div
      role="alert"
      aria-live={criticalCount > 0 ? "assertive" : "polite"}
      className="space-y-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={criticalCount > 0 ? "danger" : "warning"}>
          {criticalCount > 0 ? "Critical" : "Warning"}
        </Badge>
        <p className="text-sm font-medium">
          {atRisk.length} provider{atRisk.length === 1 ? "" : "s"} require
          attention
        </p>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {criticalCount} critical · {warningCount} degraded
        </span>
      </div>

      <div className="space-y-2">
        {atRisk.map(({ provider, state }) => {
          const isCritical = state.kind === "down";
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
                    aria-hidden="true"
                    className={cn("h-2 w-2 rounded-full", state.dotClass)}
                  />
                  <span className="font-medium">{provider.name}</span>
                  <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {provider.code}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  {isCritical
                    ? `Connection failures detected. Failure rate: ${failureRate}%`
                    : state.headline}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/providers/${provider.id}`}
                  className={cn(
                    "inline-flex h-8 items-center rounded-md px-3 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                    isCritical
                      ? "bg-danger-600 text-white hover:bg-danger-700"
                      : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  )}
                >
                  {isCritical ? "Investigate" : "View provider"}
                </Link>
                <Link
                  href={`/admin/support?providerId=${provider.id}`}
                  className="inline-flex h-8 items-center rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  See tickets
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}