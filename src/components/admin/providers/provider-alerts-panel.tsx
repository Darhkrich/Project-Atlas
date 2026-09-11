"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";

export interface ProviderAlert {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "critical";
  timestamp: string;
  acknowledged: boolean;
}

interface ProviderAlertsPanelProps {
  alerts: ProviderAlert[];
  onAcknowledge?: (id: string) => void;
  onAcknowledgeAll?: () => void;
}

export function ProviderAlertsPanel({
  alerts,
  onAcknowledge,
  onAcknowledgeAll,
}: ProviderAlertsPanelProps) {
  const [filter, setFilter] = useState<"all" | "open" | "acknowledged">("all");

  const filtered = alerts.filter((a) => {
    if (filter === "open") return !a.acknowledged;
    if (filter === "acknowledged") return a.acknowledged;
    return true;
  });

  const openCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Provider Alerts</CardTitle>
          {openCount > 0 && <Badge variant="danger">{openCount} open</Badge>}
        </div>
        <div className="flex gap-1">
          {(["all", "open", "acknowledged"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium capitalize",
                filter === f
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {f}
            </button>
          ))}
          {openCount > 0 && onAcknowledgeAll && (
            <Button variant="ghost" size="sm" onClick={onAcknowledgeAll}>
              Acknowledge all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-neutral-400">No alerts.</p>
        ) : (
          <ul className="space-y-3">
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
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={alert.severity === "critical" ? "danger" : "warning"}
                    >
                      {alert.severity}
                    </Badge>
                    <p className="text-sm font-medium">{alert.title}</p>
                    {alert.acknowledged && (
                      <Badge variant="neutral">Acknowledged</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                    {alert.description}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {!alert.acknowledged && onAcknowledge && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    Acknowledge
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}