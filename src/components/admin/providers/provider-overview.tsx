"use client";

import { Provider } from "@/lib/admin/types/provider";
import { Badge } from "@/components/admin/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { cn } from "@/lib/utils";

interface ProviderOverviewProps {
  provider: Provider;
}

function timeAgo(dateString: string | undefined) {
  if (!dateString) return "—";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ProviderOverview({ provider }: ProviderOverviewProps) {
  const isLowBalance =
    provider.balance &&
    provider.balance.current < provider.balance.criticalThreshold;

  const items: { label: string; value: React.ReactNode; highlight?: boolean }[] = [
    { label: "Provider Type", value: <span className="capitalize">{provider.type}</span> },
    { label: "Environment", value: <Badge variant={provider.environment === "production" ? "success" : "warning"}>{provider.environment}</Badge> },
    { label: "Country", value: provider.country },
    { label: "Currency", value: provider.currency },
    { label: "API Version", value: provider.apiVersion || "—" },
    { label: "Priority", value: <span className="capitalize">{provider.priority}</span> },
    { label: "Base URL", value: <span className="font-mono text-xs">{provider.baseUrl || "—"}</span> },
    { label: "Last Successful", value: timeAgo(provider.lastSuccessfulRequest) },
    { label: "Last Failed", value: timeAgo(provider.lastFailedRequest) },
  ];

  if (provider.balance) {
    items.push({
      label: "Balance",
      value: (
        <span className={cn(isLowBalance && "font-semibold text-danger-600")}>
          {provider.currency} {provider.balance.current.toLocaleString()}
          {isLowBalance && " · Low"}
        </span>
      ),
      highlight: isLowBalance,
    });
    items.push({
      label: "Min Threshold",
      value: `${provider.currency} ${provider.balance.minimumThreshold}`,
    });
  }

  return (
    <div className="space-y-4">
      {/* Health row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-0 bg-neutral-50 dark:bg-neutral-900">
          <CardContent className="p-3">
            <p className="text-xs text-neutral-500">Health</p>
            <p
              className={cn(
                "mt-1 text-lg font-bold capitalize",
                provider.healthStatus === "healthy"
                  ? "text-success-600"
                  : provider.healthStatus === "warning"
                  ? "text-warning-600"
                  : "text-danger-600"
              )}
            >
              {provider.healthStatus}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-neutral-50 dark:bg-neutral-900">
          <CardContent className="p-3">
            <p className="text-xs text-neutral-500">Success Rate</p>
            <p className="mt-1 text-lg font-bold">{provider.successRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-neutral-50 dark:bg-neutral-900">
          <CardContent className="p-3">
            <p className="text-xs text-neutral-500">Avg Response</p>
            <p className="mt-1 text-lg font-bold">{provider.averageResponseTime}ms</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-neutral-50 dark:bg-neutral-900">
          <CardContent className="p-3">
            <p className="text-xs text-neutral-500">Transactions Today</p>
            <p className="mt-1 text-lg font-bold">
              {provider.transactionCountToday.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Structured info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Provider Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-md border border-neutral-100 p-3 dark:border-neutral-800",
                  item.highlight &&
                    "border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20"
                )}
              >
                <dt className="text-xs text-neutral-500">{item.label}</dt>
                <dd className="mt-1 text-sm font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}