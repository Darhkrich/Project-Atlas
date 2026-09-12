"use client";

import Link from "next/link";
import type { Provider } from "@/lib/admin/types/provider";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import {
  providerOperationalState,
  providerBalanceState,
  isProviderPaused,
} from "@/lib/admin/providers/state";
import {
  PROVIDER_CAPABILITY_LABEL,
  PROVIDER_PAYMENT_RAIL_LABEL,
  ROUTING_PRIORITY_LABEL,
  PROVIDER_TYPE_LABEL,
} from "@/lib/admin/providers/constants";
import { ProviderStatusBadge } from "./provider-status-badge";

interface ProviderCardProps {
  provider: Provider;
  isSelected: boolean;
  onToggleSelect: () => void;
  onTest: () => void;
  onToggleStatus: () => void;
  onSetMaintenance: () => void;
  onEndMaintenance: () => void;
  affectedPlanCount?: number;
}

const typeIcon: Record<string, AtlasIconName> = {
  api: "server",
  aggregator: "grid",
  direct: "link",
  payment: "credit-card",
  internal: "shield",
  manual: "edit",
};

export function ProviderCard({
  provider,
  isSelected,
  onToggleSelect,
  onTest,
  onToggleStatus,
  onSetMaintenance,
  onEndMaintenance,
  affectedPlanCount,
}: ProviderCardProps) {
  const now = useNow();
  const state = providerOperationalState(provider);
  const balanceState = providerBalanceState(provider);
  const paused = isProviderPaused(state);

  const visibleServices = provider.services.slice(0, 3);
  const extraServices = provider.services.length - visibleServices.length;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-neutral-900",
        isSelected
          ? "border-brand-500 ring-2 ring-brand-500"
          : "border-neutral-200 dark:border-neutral-700"
      )}
    >
      <input
        type="checkbox"
        className="absolute left-3 top-3 z-10 h-4 w-4 focus-visible:ring-2 focus-visible:ring-brand-500"
        checked={isSelected}
        onChange={onToggleSelect}
        aria-label={`Select ${provider.name}`}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <AtlasIcon
              name={typeIcon[provider.type] || "server"}
              aria-hidden="true"
              className="h-5 w-5"
            />
            <span
              aria-label={`Health: ${state.label}`}
              title={state.headline}
              className={cn(
                "absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-neutral-900",
                state.dotClass
              )}
            />
          </span>
          <div className="min-w-0">
            <Link
              href={`/admin/providers/${provider.id}`}
              className="block truncate text-base font-semibold text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {provider.name}
            </Link>
            <p className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {provider.code} · {PROVIDER_TYPE_LABEL[provider.type]}
            </p>
          </div>
        </div>
        <ProviderStatusBadge provider={provider} size="sm" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {visibleServices.map((svc) => (
          <Badge key={svc.id} variant="neutral" size="sm">
            {svc.paymentRail
              ? PROVIDER_PAYMENT_RAIL_LABEL[svc.paymentRail]
              : svc.network
              ? `${PROVIDER_CAPABILITY_LABEL[svc.capability]} · ${svc.network}`
              : PROVIDER_CAPABILITY_LABEL[svc.capability]}
          </Badge>
        ))}
        {extraServices > 0 && (
          <span className="self-center text-xs text-neutral-500 dark:text-neutral-400">
            +{extraServices}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Success rate
          </p>
          <p className="font-semibold">{provider.successRate}%</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Response
          </p>
          <p className="font-semibold">{provider.averageResponseTime}ms</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Priority
          </p>
          <p className="font-semibold">
            {ROUTING_PRIORITY_LABEL[provider.priority]}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Transactions today
          </p>
          <p className="font-semibold">
            {formatNumber(provider.transactionCountToday)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          Last check {formatRelative(provider.lastHealthCheck, now)}
        </span>
        {balanceState && provider.balance && (
          <span
            className={cn(
              "font-medium",
              balanceState.kind === "critical" && "text-danger-600",
              balanceState.kind === "low" && "text-warning-600"
            )}
          >
            {formatCurrency(provider.balance.current, provider.currency)}{" "}
            {balanceState.kind !== "ok" ? `· ${balanceState.label}` : ""}
          </span>
        )}
      </div>

      {typeof affectedPlanCount === "number" && affectedPlanCount > 0 && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {affectedPlanCount} plan{affectedPlanCount === 1 ? "" : "s"} depend
          on this provider
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <Can permission={PERMISSIONS.PROVIDERS_MANAGE}>
          <Button variant="outline" size="sm" onClick={onTest}>
            <AtlasIcon
              name="activity"
              aria-hidden="true"
              className="mr-1 h-3.5 w-3.5"
            />
            Test
          </Button>
          {paused ? (
            <Button variant="outline" size="sm" onClick={onEndMaintenance}>
              <AtlasIcon
                name="check"
                aria-hidden="true"
                className="mr-1 h-3.5 w-3.5"
              />
              Enable
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onToggleStatus}>
                <AtlasIcon
                  name="x-circle"
                  aria-hidden="true"
                  className="mr-1 h-3.5 w-3.5"
                />
                Disable
              </Button>
              <Button variant="ghost" size="sm" onClick={onSetMaintenance}>
                <AtlasIcon
                  name="clock"
                  aria-hidden="true"
                  className="mr-1 h-3.5 w-3.5"
                />
                Maintenance
              </Button>
            </>
          )}
        </Can>
        <Link
          href={`/admin/providers/${provider.id}`}
          className="ml-auto inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          View details
        </Link>
      </div>
    </div>
  );
}