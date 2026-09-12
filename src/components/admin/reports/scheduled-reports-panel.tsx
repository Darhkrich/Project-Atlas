// components/admin/reports/scheduled-reports-panel.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  FORMAT_LABEL,
  RUN_STATUS_LABEL,
  RUN_STATUS_VARIANT,
  SCHEDULE_LABEL,
  SECTION_SCOPE_LABEL,
} from "@/lib/admin/reports/constants";
import type { ScheduledReport } from "@/lib/admin/types/report";

interface ScheduledReportsPanelProps {
  reports: ScheduledReport[];
  onToggle: (id: string) => void;
  onEdit: (schedule: ScheduledReport) => void;
  onDelete: (id: string) => void;
  onGenerateNow: (schedule: ScheduledReport) => void;
  onCreate: () => void;
}

interface ToggleIntent {
  schedule: ScheduledReport;
  enabling: boolean;
}

export function ScheduledReportsPanel({
  reports,
  onToggle,
  onEdit,
  onDelete,
  onGenerateNow,
  onCreate,
}: ScheduledReportsPanelProps) {
  const [toggleIntent, setToggleIntent] = useState<ToggleIntent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScheduledReport | null>(null);
  const now = useNow();

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Scheduled reports</CardTitle>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Recurring reports delivered by email. Times are in Ghana time.
          </p>
        </div>
        <Button size="sm" onClick={onCreate}>
          Schedule a report
        </Button>
      </CardHeader>

      <CardContent className="space-y-2">
        {reports.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No scheduled reports yet.
          </p>
        ) : (
          reports.map((sched) => (
            <div
              key={sched.id}
              className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {sched.reportName}
                    </p>
                    <Badge variant={sched.enabled ? "success" : "neutral"} size="sm">
                      {sched.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    {sched.lastRunStatus && (
                      <Badge variant={RUN_STATUS_VARIANT[sched.lastRunStatus]} size="sm">
                        {RUN_STATUS_LABEL[sched.lastRunStatus]}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge variant="brand" size="sm">
                      {SCHEDULE_LABEL[sched.schedule]}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {SECTION_SCOPE_LABEL[sched.section]}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      {FORMAT_LABEL[sched.format]}
                    </Badge>
                  </div>

                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    To{" "}
                    {sched.recipients
                      .map((r) => r.name ?? r.email)
                      .join(", ")}
                  </p>

                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    Next run{" "}
                    <time
                      dateTime={sched.nextRunAt}
                      title={formatAbsolute(sched.nextRunAt)}
                    >
                      {formatRelative(sched.nextRunAt, now)}
                    </time>
                    {sched.lastRunAt && (
                      <>
                        {" · Last run "}
                        <time
                          dateTime={sched.lastRunAt}
                          title={formatAbsolute(sched.lastRunAt)}
                        >
                          {formatRelative(sched.lastRunAt, now)}
                        </time>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGenerateNow(sched)}
                  >
                    Run now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(sched)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant={sched.enabled ? "ghost" : "outline"}
                    size="sm"
                    onClick={() =>
                      setToggleIntent({
                        schedule: sched,
                        enabling: !sched.enabled,
                      })
                    }
                  >
                    {sched.enabled ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(sched)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <ConfirmDialog
        open={toggleIntent !== null}
        title={
          toggleIntent?.enabling
            ? "Enable scheduled report?"
            : "Disable scheduled report?"
        }
        description={
          toggleIntent
            ? toggleIntent.enabling
              ? `${toggleIntent.schedule.reportName} will begin delivering to ${toggleIntent.schedule.recipients
                  .map((r) => r.name ?? r.email)
                  .join(", ")} on the ${toggleIntent.schedule.schedule} cadence.`
              : `${toggleIntent.schedule.reportName} will stop delivering until you re-enable it.`
            : ""
        }
        confirmLabel={toggleIntent?.enabling ? "Enable" : "Disable"}
        danger={toggleIntent?.enabling === true}
        onConfirm={() => {
          if (!toggleIntent) return;
          onToggle(toggleIntent.schedule.id);
          setToggleIntent(null);
        }}
        onCancel={() => setToggleIntent(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete scheduled report?"
        description={
          deleteTarget
            ? `${deleteTarget.reportName} will stop running and be removed from this list. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete schedule"
        danger
        onConfirm={() => {
          if (!deleteTarget) return;
          onDelete(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </Card>
  );
}