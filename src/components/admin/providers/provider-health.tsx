"use client";

import { useEffect, useRef, useState } from "react";
import type { Provider } from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import {
  HEALTH_OUTCOME_LABEL,
  HEALTH_OUTCOME_VARIANT,
} from "@/lib/admin/providers/constants";
import { formatRelative } from "@/lib/admin/support/format";
import { formatDateTime } from "@/lib/admin/formatters";
import { useNow } from "@/lib/admin/hooks/use-now";
import {
  providerBalanceState,
  providerOperationalState,
} from "@/lib/admin/providers/state";
import {
  runProviderHealthCheck,
  type HealthCheckRun,
} from "@/lib/admin/providers/health";
import { appendHealthCheck, appendAudit } from "@/lib/admin/mock/providers-store";

interface ProviderHealthProps {
  provider: Provider;
}

export function ProviderHealth({ provider }: ProviderHealthProps) {
  const now = useNow();
  const admin = useCurrentAdmin();
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<HealthCheckRun | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const state = providerOperationalState(provider);
  const balance = providerBalanceState(provider);
  const authValid = provider.credentials.hasApiKey && provider.credentials.hasSecret;

  const runCheck = () => {
    if (running) return;
    setRunning(true);
    setLastRun(null);
    timerRef.current = window.setTimeout(async () => {
      const run = await runProviderHealthCheck(provider);
      appendHealthCheck(provider.id, {
        providerId: provider.id,
        timestamp: run.timestamp,
        outcome: run.outcome,
        responseTime: run.responseTime,
        details: run.details,
      });
      appendAudit(provider.id, {
        providerId: provider.id,
        scope: "provider",
        admin: admin?.name ?? "System",
        adminEmail: admin?.email ?? "system@atlas.com",
        action: "Health check run",
        timestamp: run.timestamp,
        newValue: run.outcome,
      });
      setLastRun(run);
      setRunning(false);
    }, 900);
  };

  const checkRows = lastRun
    ? ([
        { key: "api", label: "API reachable", outcome: lastRun.details.api },
        { key: "auth", label: "Authentication valid", outcome: lastRun.details.auth },
        { key: "latency", label: "Latency within threshold", outcome: lastRun.details.latency },
        { key: "routing", label: "Routing configured", outcome: lastRun.details.routing },
      ] as const)
    : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Provider health</CardTitle>
        <Can permission={PERMISSIONS.PROVIDERS_MANAGE}>
          <Button
            variant="outline"
            size="sm"
            onClick={runCheck}
            disabled={running}
          >
            {running ? "Running..." : "Run health check"}
          </Button>
        </Can>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <Row label="Operational state">
            <span>{state.label}</span>
          </Row>
          <Row label="API">
            <span
              className={cn(
                state.kind === "live" && "text-success-600",
                state.kind === "impaired" && "text-warning-600",
                state.kind === "down" && "text-danger-600",
                (state.kind === "disabled" ||
                  state.kind === "maintenance") &&
                  "text-neutral-500 dark:text-neutral-400"
              )}
            >
              {state.kind === "live"
                ? "Operational"
                : state.kind === "impaired"
                ? "Degraded"
                : state.kind === "down"
                ? "Not responding"
                : "Paused"}
            </span>
          </Row>
          <Row label="Authentication">
            <span
              className={
                authValid
                  ? "text-success-600"
                  : "text-danger-600"
              }
            >
              {authValid ? "Valid" : "Missing credentials"}
            </span>
          </Row>
          <Row label="Latency">
            <span
              className={cn(
                provider.averageResponseTime < 800
                  ? "text-success-600"
                  : provider.averageResponseTime < 3000
                  ? "text-warning-600"
                  : "text-danger-600"
              )}
            >
              {provider.averageResponseTime}ms
            </span>
          </Row>
          <Row label="Error rate">
            <span
              className={cn(
                provider.successRate >= 97
                  ? "text-success-600"
                  : provider.successRate >= 90
                  ? "text-warning-600"
                  : "text-danger-600"
              )}
            >
              {(100 - provider.successRate).toFixed(1)}%
            </span>
          </Row>
          {balance && provider.balance && (
            <Row label="Balance">
              <span
                className={cn(
                  balance.kind === "critical" && "text-danger-600",
                  balance.kind === "low" && "text-warning-600"
                )}
              >
                {provider.balance.current} {provider.currency}
                {balance.kind !== "ok" ? ` · ${balance.label}` : ""}
              </span>
            </Row>
          )}
          <Row label="Last check">
            <span
              className="text-xs text-neutral-500 dark:text-neutral-400"
              title={formatDateTime(provider.lastHealthCheck)}
            >
              {formatRelative(provider.lastHealthCheck, now)}
            </span>
          </Row>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="min-h-[1px]"
        >
          {lastRun && (
            <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Health check result
                </p>
                <Badge variant={HEALTH_OUTCOME_VARIANT[lastRun.outcome]} size="sm">
                  {HEALTH_OUTCOME_LABEL[lastRun.outcome]}
                </Badge>
              </div>
              <ul role="list" className="space-y-1.5 text-sm">
                {checkRows.map((row) => (
                  <li key={row.key} className="flex items-center gap-2">
                    <OutcomeIcon outcome={row.outcome} />
                    <span>{row.label}</span>
                    <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">
                      {HEALTH_OUTCOME_LABEL[row.outcome]}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                Checked {formatRelative(lastRun.timestamp, now)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      {children}
    </div>
  );
}

function OutcomeIcon({ outcome }: { outcome: string }) {
  if (outcome === "pass")
    return (
      <AtlasIcon
        name="check"
        aria-label="Pass"
        className="h-3.5 w-3.5 text-success-600"
      />
    );
  if (outcome === "fail")
    return (
      <AtlasIcon
        name="x-circle"
        aria-label="Fail"
        className="h-3.5 w-3.5 text-danger-600"
      />
    );
  if (outcome === "warn")
    return (
      <AtlasIcon
        name="alert"
        aria-label="Warning"
        className="h-3.5 w-3.5 text-warning-600"
      />
    );
  return (
    <AtlasIcon
      name="clock"
      aria-label="Skipped"
      className="h-3.5 w-3.5 text-neutral-400"
    />
  );
}