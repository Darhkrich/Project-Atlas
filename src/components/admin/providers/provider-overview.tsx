"use client";

import type { Provider } from "@/lib/admin/types/provider";
import { Badge } from "@/components/admin/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import {
  PROVIDER_CAPABILITY_LABEL,
  PROVIDER_PAYMENT_RAIL_LABEL,
  PROVIDER_TYPE_LABEL,
  ROUTING_PRIORITY_LABEL,
  ENVIRONMENT_LABEL,
} from "@/lib/admin/providers/constants";
import {
  providerBalanceState,
  providerOperationalState,
  providerSLAStatus,
} from "@/lib/admin/providers/state";

interface ProviderOverviewProps {
  provider: Provider;
}

export function ProviderOverview({ provider }: ProviderOverviewProps) {
  const now = useNow();
  const state = providerOperationalState(provider);
  const balance = providerBalanceState(provider);
  const sla = providerSLAStatus(provider);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-0 bg-neutral-50 dark:bg-neutral-900">
          <CardContent className="p-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Operational state
            </p>
            <p className="mt-1 text-lg font-bold">{state.label}</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-neutral-50 dark:bg-neutral-900">
          <CardContent className="p-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Success rate
            </p>
            <p className="mt-1 text-lg font-bold">{provider.successRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-neutral-50 dark:bg-neutral-900">
          <CardContent className="p-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Avg response
            </p>
            <p className="mt-1 text-lg font-bold">
              {provider.averageResponseTime}ms
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-neutral-50 dark:bg-neutral-900">
          <CardContent className="p-3">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Transactions today
            </p>
            <p className="mt-1 text-lg font-bold">
              {formatNumber(provider.transactionCountToday)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Provider information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Type" value={PROVIDER_TYPE_LABEL[provider.type]} />
            <Info label="Environment" value={ENVIRONMENT_LABEL[provider.environment]} />
            <Info label="Country" value={provider.country} />
            <Info label="Currency" value={provider.currency} />
            <Info label="API version" value={provider.apiVersion || "—"} />
            <Info
              label="Priority"
              value={ROUTING_PRIORITY_LABEL[provider.priority]}
            />
            <Info
              label="Base URL"
              value={
                <span className="font-mono text-xs">
                  {provider.baseUrl || "—"}
                </span>
              }
              span="full"
            />
            <Info
              label="Last successful"
              value={
                provider.lastSuccessfulRequest
                  ? formatRelative(provider.lastSuccessfulRequest, now)
                  : "—"
              }
            />
            <Info
              label="Last failed"
              value={
                provider.lastFailedRequest
                  ? formatRelative(provider.lastFailedRequest, now)
                  : "—"
              }
            />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">SLA targets</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SLAItem
              label="Uptime"
              target={`${provider.sla.targetUptime}%`}
              actual={`${provider.successRate}%`}
              met={sla.uptime.met}
            />
            <SLAItem
              label="Latency"
              target={`${provider.sla.targetLatencyMs}ms`}
              actual={`${provider.averageResponseTime}ms`}
              met={sla.latency.met}
            />
            <SLAItem
              label="Success rate"
              target={`${provider.sla.targetSuccessRate}%`}
              actual={`${provider.successRate}%`}
              met={sla.successRate.met}
            />
          </dl>
        </CardContent>
      </Card>

      {provider.balance && balance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Info
                label="Current"
                value={
                  <span
                    className={cn(
                      balance.kind === "critical" && "font-semibold text-danger-600",
                      balance.kind === "low" && "font-semibold text-warning-600"
                    )}
                  >
                    {formatCurrency(provider.balance.current, provider.currency)}
                    {balance.kind !== "ok" ? ` · ${balance.label}` : ""}
                  </span>
                }
              />
              <Info
                label="Minimum threshold"
                value={formatCurrency(
                  provider.balance.minimumThreshold,
                  provider.currency
                )}
              />
              <Info
                label="Critical threshold"
                value={formatCurrency(
                  provider.balance.criticalThreshold,
                  provider.currency
                )}
              />
            </dl>
          </CardContent>
        </Card>
      )}

      {provider.services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ul role="list" className="flex flex-wrap gap-2">
              {provider.services.map((s) => (
                <li key={s.id}>
                  <Badge variant="neutral">
                    {s.paymentRail
                      ? PROVIDER_PAYMENT_RAIL_LABEL[s.paymentRail]
                      : s.network
                      ? `${PROVIDER_CAPABILITY_LABEL[s.capability]} · ${s.network}`
                      : PROVIDER_CAPABILITY_LABEL[s.capability]}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Info({
  label,
  value,
  span,
}: {
  label: string;
  value: React.ReactNode;
  span?: "full";
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-neutral-100 p-3 dark:border-neutral-800",
        span === "full" && "sm:col-span-2 lg:col-span-3"
      )}
    >
      <dt className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function SLAItem({
  label,
  target,
  actual,
  met,
}: {
  label: string;
  target: string;
  actual: string;
  met: boolean;
}) {
  return (
    <div className="rounded-md border border-neutral-100 p-3 dark:border-neutral-800">
      <dt className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="mt-1 flex items-center gap-2 text-sm font-medium">
        <span>{actual}</span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          vs {target}
        </span>
        <Badge variant={met ? "success" : "danger"} size="sm">
          {met ? "Met" : "Missed"}
        </Badge>
      </dd>
    </div>
  );
}