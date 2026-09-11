"use client";

import { Provider } from "@/lib/admin/types/provider";
import { ProviderStatusBadge } from "./provider-status-badge";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProviderCardProps {
  provider: Provider;
  onTest: () => void;
  onToggleStatus: () => void;
  onSetMaintenance: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const providerTypeIconMap: Record<string, AtlasIconName> = {
  api: "server",
  aggregator: "grid",
  direct: "link",
  payment: "credit-card",
  internal: "shield",
  manual: "edit",
};

export function ProviderCard({
  provider,
  onTest,
  onToggleStatus,
  onSetMaintenance,
  isSelected,
  onToggleSelect,
}: ProviderCardProps) {
  const isLowBalance =
    provider.balance &&
    provider.balance.current < provider.balance.criticalThreshold;

  const healthDotColor =
    provider.healthStatus === "healthy"
      ? "bg-success-500"
      : provider.healthStatus === "warning"
      ? "bg-warning-500"
      : "bg-danger-500";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900",
        isSelected
          ? "border-brand-500 ring-2 ring-brand-500"
          : "border-neutral-200 dark:border-neutral-700"
      )}
    >
      {/* Selection checkbox */}
      {onToggleSelect && (
        <input
          type="checkbox"
          className="absolute left-3 top-3 z-10 h-4 w-4"
          checked={isSelected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <AtlasIcon
              name={providerTypeIconMap[provider.type] || "server"}
              className="h-5 w-5"
            />
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-neutral-900",
                healthDotColor
              )}
            />
          </span>
          <div className="min-w-0">
            <Link
              href={`/admin/providers/${provider.id}`}
              className="block truncate text-base font-semibold text-brand-600 hover:underline"
            >
              {provider.name}
            </Link>
            <p className="font-mono text-xs text-neutral-500">{provider.code}</p>
          </div>
        </div>
        <ProviderStatusBadge status={provider.status} />
      </div>

      {/* Services */}
      <div className="mt-3 flex flex-wrap gap-1">
        {provider.services.slice(0, 3).map((svc) => (
          <Badge key={svc.id} variant="neutral">
            {svc.serviceCategory}
          </Badge>
        ))}
        {provider.services.length > 3 && (
          <span className="text-xs text-neutral-500">
            +{provider.services.length - 3}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-neutral-500">Success Rate</p>
          <p
            className={cn(
              "font-semibold",
              provider.successRate >= 97
                ? "text-success-600"
                : provider.successRate >= 90
                ? "text-warning-600"
                : "text-danger-600"
            )}
          >
            {provider.successRate}%
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Response Time</p>
          <p className="font-semibold">{provider.averageResponseTime}ms</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Transactions Today</p>
          <p className="font-semibold">
            {provider.transactionCountToday.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Priority</p>
          <p className="font-semibold capitalize">{provider.priority}</p>
        </div>
      </div>

      {/* Footer meta */}
      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <span>Last check: {timeAgo(provider.lastHealthCheck)}</span>
        {provider.balance && (
          <span
            className={cn(
              "font-medium",
              isLowBalance ? "text-danger-600" : "text-neutral-500"
            )}
          >
            {isLowBalance ? "⚠ " : ""}
            Balance: {provider.balance.current}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <Button variant="outline" size="sm" onClick={onTest}>
          <AtlasIcon name="activity" className="mr-1 h-3.5 w-3.5" />
          Test
        </Button>
        <Button variant="outline" size="sm" onClick={onToggleStatus}>
          <AtlasIcon
            name={provider.status === "active" ? "x-circle" : "check"}
            className="mr-1 h-3.5 w-3.5"
          />
          {provider.status === "active" ? "Disable" : "Enable"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onSetMaintenance}>
          <AtlasIcon name="clock" className="mr-1 h-3.5 w-3.5" />
          Maintenance
        </Button>
        <Link href={`/admin/providers/${provider.id}`} className="ml-auto">
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}