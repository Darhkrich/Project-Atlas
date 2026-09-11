"use client";

import { CustomerReport } from "@/lib/admin/types/customer";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface ReportCardProps {
  report: CustomerReport & { customerId: string; customerName: string };
  onViewCustomer: (customerId: string) => void;
  onTakeAction: (reportId: string) => void;
  onDismiss: (reportId: string) => void;
  onSuspend: (customerId: string) => void;
}

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ReportCard({
  report,
  onViewCustomer,
  onTakeAction,
  onDismiss,
  onSuspend,
}: ReportCardProps) {
  const statusVariant =
    report.status === "pending"
      ? "warning"
      : report.status === "action_taken"
      ? "success"
      : "neutral";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm transition-all dark:bg-neutral-900",
        report.status === "pending"
          ? "border-warning-200 dark:border-warning-800"
          : "border-neutral-200 dark:border-neutral-700"
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
              report.status === "pending"
                ? "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-300"
                : report.status === "action_taken"
                ? "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-300"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            )}
          >
            <AtlasIcon
              name={
                report.status === "pending"
                  ? "alert"
                  : report.status === "action_taken"
                  ? "shield"
                  : "x-circle"
              }
              className="h-4 w-4"
            />
          </span>
          <div className="min-w-0">
            <button
              onClick={() => onViewCustomer(report.customerId)}
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              {report.customerName}
            </button>
            <p className="mt-1 text-xs text-neutral-500">
              Reported by{" "}
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {report.reporterName}
              </span>{" "}
              ({report.reporterType})
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Badge variant={statusVariant}>
            {report.status.replace("_", " ")}
          </Badge>
          <Badge variant={report.reporterType === "reseller" ? "info" : "success"}>
            {report.reporterType}
          </Badge>
        </div>
      </div>

      {/* Reason */}
      <div className="mt-3 rounded-md bg-neutral-50 p-3 dark:bg-neutral-800/50">
        <p className="text-xs font-medium text-neutral-500">Reason</p>
        <p className="mt-1 text-sm font-medium">{report.reason}</p>
        {report.details && (
          <p className="mt-1 text-xs text-neutral-500">{report.details}</p>
        )}
      </div>

      {/* Admin note */}
      {report.adminNote && (
        <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-2 text-xs dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-500">Admin note</p>
          <p className="mt-0.5 text-neutral-700 dark:text-neutral-300">
            {report.adminNote}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <span className="text-xs text-neutral-400">
          {timeAgo(report.timestamp)}
        </span>
        <div className="flex flex-wrap gap-2">
          {report.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTakeAction(report.id)}
              >
                Take Action
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(report.id)}
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-danger-600"
                onClick={() => onSuspend(report.customerId)}
              >
                Suspend
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewCustomer(report.customerId)}
          >
            View Customer
          </Button>
        </div>
      </div>
    </div>
  );
}