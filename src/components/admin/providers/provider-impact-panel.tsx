/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/providers/provider-impact-panel.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Provider } from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import {
  PROVIDER_CAPABILITY_LABEL,
} from "@/lib/admin/providers/constants";
import {
  providerCostRiseImpact,
  providerImpact,
} from "@/lib/admin/providers/impact";
import { computeMargin } from "@/lib/admin/data-plans/helpers";
import { marginBand, MARGIN_BAND_LABEL } from "@/lib/admin/data-plans/constants";
import { useCatalog } from "@/lib/admin/hooks/use-catalog";

interface ProviderImpactPanelProps {
  provider: Provider;
}

const RISES = [5, 10, 20];

export function ProviderImpactPanel({ provider }: ProviderImpactPanelProps) {
  const { categories: catalog } = useCatalog();

  const impact = useMemo(
    () => providerImpact(provider, catalog),
    [provider, catalog]
  );

  const rises = useMemo(
    () =>
      RISES.map((percent) => ({
        percent,
        results: providerCostRiseImpact(provider, catalog, percent),
      })),
    [provider, catalog]
  );

  const impactedByPlan = useMemo(() => {
    const byPlan = new Map<string, { name: string; categoryName: string }>();
    for (const { plan, categoryName } of impact.plans) {
      if (!byPlan.has(plan.id)) {
        byPlan.set(plan.id, { name: plan.name, categoryName });
      }
    }
    return Array.from(byPlan.values());
  }, [impact.plans]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric
            label="Services"
            value={formatNumber(impact.serviceCount)}
          />
          <Metric
            label="Plans depending"
            value={formatNumber(impact.planCount)}
          />
          <Metric
            label="Transactions today"
            value={formatNumber(impact.transactionVolumeToday)}
          />
        </div>

        {impact.services.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Capabilities provided
            </p>
            <ul role="list" className="flex flex-wrap gap-2">
              {impact.services.map((s) => (
                <li key={s.id}>
                  <Badge variant="neutral" size="sm">
                    {PROVIDER_CAPABILITY_LABEL[s.capability]}
                    {s.network ? " \u00B7 " + s.network : ""}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {impact.planCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Plans depending on this provider
              </p>
              <Link
                href={"/admin/data-plans?provider=" + provider.id}
                className="rounded-sm text-xs font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
              >
                View all in Data Plans
              </Link>
            </div>
            <ul
              role="list"
              className="max-h-52 space-y-1 overflow-y-auto rounded-md border border-neutral-100 p-2 text-xs dark:border-neutral-800"
            >
              {impact.plans.slice(0, 30).map(({ plan, categoryName, network }) => {
                const margin = computeMargin(plan);
                const band = margin ? marginBand(margin.percent) : null;
                return (
                  <li
                    key={plan.id + "-" + categoryName + "-" + (network ?? "")}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      {plan.name}
                      <span className="ml-1 text-neutral-400 dark:text-neutral-500">
                        {network ? "\u00B7 " + network + " " : ""}
                        {"\u00B7 "}
                        {categoryName}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {formatCurrency(plan.price)}
                      </span>
                      {band && (
                        <span
                          className={cn(
                            "text-[10px] font-medium",
                            band === "healthy" && "text-success-600",
                            band === "ok" && "text-info-600",
                            band === "tight" && "text-warning-600",
                            band === "critical" && "text-danger-600"
                          )}
                        >
                          {MARGIN_BAND_LABEL[band]}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
              {impact.plans.length > 30 && (
                <li className="text-center text-neutral-500 dark:text-neutral-400">
                  +{impact.plans.length - 30} more
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Sensitivity to cost increase
          </p>
          <div className="space-y-2">
            {rises.map(({ percent, results }) => {
              const worsens = results.filter(
                (r) =>
                  r.currentMarginPercent !== null &&
                  r.projectedMarginPercent !== null &&
                  r.projectedMarginPercent < r.currentMarginPercent
              ).length;
              const goesCritical = results.filter(
                (r) =>
                  r.band === "critical" &&
                  r.currentMarginPercent !== null &&
                  r.currentMarginPercent >= 5
              ).length;
              return (
                <div
                  key={percent}
                  className="flex items-center justify-between rounded-md border border-neutral-100 px-3 py-2 text-xs dark:border-neutral-800"
                >
                  <span className="text-neutral-600 dark:text-neutral-400">
                    If provider cost rises {percent}%
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {worsens} plans tighten
                    </span>
                    {goesCritical > 0 && (
                      <Badge variant="danger" size="sm">
                        {goesCritical} to critical
                      </Badge>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {impact.planCount === 0 && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            No plans in the catalog currently route through this provider.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-100 p-3 dark:border-neutral-800">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}