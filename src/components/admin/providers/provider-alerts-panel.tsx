/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { ProviderAlert } from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/admin/support/format";
import { formatDateTime } from "@/lib/admin/formatters";
import { useNow } from "@/lib/admin/hooks/use-now";
import {
  ALERT_SEVERITY_LABEL,
  ALERT_SEVERITY_VARIANT,
} from "@/lib/admin/providers/constants";

type Filter = "all" | "open" | "acknowledged";

interface ProviderAlertsPanelProps {
  providerId: string;
  alerts: ProviderAlert[];
  onAcknowledge: (id: string) => void;
  onUnacknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export function ProviderAlertsPanel({
  providerId,
  alerts,
  onAcknowledge,
  onUnacknowledge,
  onAcknowledgeAll,
}: ProviderAlertsPanelProps) {
  const now = useNow();
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmAll, setConfirmAll] = useState(false);

  useEffect(() => {
    setFilter("all");
  }, [providerId]);

  const sorted = useMemo(() => {
    const severityWeight = { critical: 0, warning: 1 } as const;
    return [...alerts].sort((a, b) => {
      if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
      const s = severityWeight[a.severity] - severityWeight[b.severity];
      if (s !== 0) return s;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [alerts]);

  const filtered = sorted.filter((a) => {
    if (filter === "open") return !a.acknowledged;
    if (filter === "acknowledged") return a.acknowledged;
    return true;
  });

  const openCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Provider alerts</CardTitle>
          <span
            role="status"
            aria-live="polite"
            className="text-xs text-neutral-500 dark:text-neutral-400"
          >
            {openCount} open
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Alert filter"
            className="flex gap-1"
          >
            {(["all", "open", "acknowledged"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  filter === f
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                )}
              >
                {f === "all"
                  ? "All"
                  : f === "open"
                  ? "Open"
                  : "Acknowledged"}
              </button>
            ))}
          </div>
          {openCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmAll(true)}
            >
              Acknowledge all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            {alerts.length === 0
              ? "No alerts recorded."
              : "No alerts match this filter."}
          </p>
        ) : (
          <ul role="list" className="space-y-3">
            {filtered.map((alert) => (
              <li
                key={alert.id}
                className={cn(
                  "flex flex-wrap items-start justify-between gap-3 rounded-lg border p-3",
                  alert.acknowledged
                    ? "border-neutral-200 dark:border-neutral-800"
                    : alert.severity === "critical"
                    ? "border-danger-200 bg-danger-50 dark:border-danger-800 dark:bg-danger-900/20"
                    : "border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={ALERT_SEVERITY_VARIANT[alert.severity]}
                      size="sm"
                    >
                      {ALERT_SEVERITY_LABEL[alert.severity]}
                    </Badge>
                    <p className="text-sm font-medium">{alert.title}</p>
                    {alert.acknowledged && (
                      <Badge variant="neutral" size="sm">
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                    {alert.description}
                  </p>
                  <p
                    className="mt-1 text-xs text-neutral-400 dark:text-neutral-500"
                    title={formatDateTime(alert.timestamp)}
                  >
                    {formatRelative(alert.timestamp, now)}
                    {alert.acknowledged && alert.acknowledgedBy
                      ? ` · acknowledged by ${alert.acknowledgedBy}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/data-plans?provider=${providerId}`}
                    className="inline-flex h-8 items-center rounded-md border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  >
                    See affected plans
                  </Link>
                  {!alert.acknowledged ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUnacknowledge(alert.id)}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ConfirmDialog
        open={confirmAll}
        title="Acknowledge all alerts"
        description={`Acknowledge ${openCount} open alert${
          openCount === 1 ? "" : "s"
        }? Each can still be reopened individually.`}
        confirmLabel="Acknowledge all"
        onConfirm={() => {
          onAcknowledgeAll();
          setConfirmAll(false);
        }}
        onCancel={() => setConfirmAll(false)}
      />
    </Card>
  );
}