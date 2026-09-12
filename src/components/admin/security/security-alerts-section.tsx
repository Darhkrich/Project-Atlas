// components/admin/security/security-alerts-section.tsx
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import type { SecurityAlert } from "@/lib/admin/types/security";

interface SecurityAlertsSectionProps {
  alerts: SecurityAlert[];
  onAcknowledge: (id: string) => void;
  onUnacknowledge: (id: string) => void;
  onViewEvents: (eventIds: string[]) => void;
}

export function SecurityAlertsSection({
  alerts,
  onAcknowledge,
  onUnacknowledge,
  onViewEvents,
}: SecurityAlertsSectionProps) {
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const now = useNow();

  const unack = useMemo(
    () => alerts.filter((a) => !a.acknowledged),
    [alerts]
  );
  const ack = useMemo(
    () => alerts.filter((a) => a.acknowledged),
    [alerts]
  );

  const visible = showAcknowledged ? ack : unack;

  const handleAcknowledgeAll = () => {
    for (const alert of unack) {
      onAcknowledge(alert.id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>
            Security alerts{" "}
            <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
              ({unack.length} open)
            </span>
          </CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Alerts are generated when a threshold is crossed. Acknowledging
            them records who resolved them and when.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unack.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcknowledgeAll}
            >
              Acknowledge all
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={showAcknowledged}
            onClick={() => setShowAcknowledged((v) => !v)}
          >
            {showAcknowledged ? "Show open" : `Show acknowledged (${ack.length})`}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {visible.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {showAcknowledged
              ? "No acknowledged alerts yet."
              : "No open alerts. You're caught up."}
          </p>
        ) : (
          visible.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {alert.title}
                  </p>
                  <Badge
                    variant={alert.severity === "critical" ? "danger" : "warning"}
                  >
                    {alert.severity}
                  </Badge>
                  {alert.acknowledged && (
                    <Badge variant="neutral" size="sm">
                      Acknowledged
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {alert.description}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <time
                    dateTime={alert.timestamp}
                    title={formatAbsolute(alert.timestamp)}
                  >
                    {formatRelative(alert.timestamp, now)}
                  </time>
                  {alert.acknowledgedByName && alert.acknowledgedAt && (
                    <>
                      {" · Acknowledged by "}
                      {alert.acknowledgedByName}{" "}
                      <time
                        dateTime={alert.acknowledgedAt}
                        title={formatAbsolute(alert.acknowledgedAt)}
                      >
                        {formatRelative(alert.acknowledgedAt, now)}
                      </time>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {alert.eventIds && alert.eventIds.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewEvents(alert.eventIds ?? [])}
                  >
                    View {alert.eventIds.length} event
                    {alert.eventIds.length === 1 ? "" : "s"}
                  </Button>
                )}
                {alert.acknowledged ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUnacknowledge(alert.id)}
                  >
                    Reopen
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAcknowledge(alert.id)}
                  >
                    Acknowledge
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}