/* eslint-disable react-hooks/purity */
// components/admin/reported-accounts/report-card.tsx
"use client";

import Link from "next/link";
import { Badge } from "@/components/admin/ui/badge";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { routes } from "@/lib/admin/routes";
import {
  CATEGORY_LABEL,
  CATEGORY_VARIANT,
  STATUS_LABEL,
  STATUS_VARIANT,
} from "@/lib/admin/reported-accounts/constants";
import {
  actionLabel,
  type ReportAction,
} from "@/lib/admin/reported-accounts/actions";
import {
  actionsForCategory,
  ageHours,
  formatAge,
  slaTone,
  type AggregatedReport,
} from "@/lib/admin/reported-accounts/helpers";

interface ReportCardProps {
  report: AggregatedReport;
  focused: boolean;
  onOpenAccount: (report: AggregatedReport) => void;
  onResolve: (report: AggregatedReport, action: ReportAction) => void;
  onFocus: (id: string) => void;
}

export function ReportCard({
  report,
  focused,
  onOpenAccount,
  onResolve,
  onFocus,
}: ReportCardProps) {
  const now = useNow();
  const ageH = ageHours(report, now ?? Date.now());
  const tone = slaTone(report, now ?? Date.now());
  const isPending = report.status === "pending";
  const actions = actionsForCategory(report.category);

  return (
    <li
      data-report-id={report.id}
      onMouseEnter={() => onFocus(report.id)}
      className={cn(
        "flex flex-col rounded-lg border bg-white transition-all dark:bg-neutral-900",
        "border-neutral-200 hover:shadow-md dark:border-neutral-700",
        focused && "ring-1 ring-brand-300 dark:ring-brand-800",
        tone === "danger" && "border-danger-300 dark:border-danger-800/60"
      )}
    >
      <button
        type="button"
        onClick={() => onOpenAccount(report)}
        className="w-full rounded-t-lg px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={CATEGORY_VARIANT[report.category]}>
            {CATEGORY_LABEL[report.category]}
          </Badge>
          <Badge variant={STATUS_VARIANT[report.status]}>
            {STATUS_LABEL[report.status]}
          </Badge>
          {isPending && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-medium",
                tone === "danger"
                  ? "text-danger-700 dark:text-danger-300"
                  : tone === "warning"
                  ? "text-warning-700 dark:text-warning-300"
                  : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              <StatusDot tone={tone === "neutral" ? "neutral" : tone} size="sm" />
              {formatAge(ageH)}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {report.reason}
        </p>

        {report.details && (
          <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
            {report.details}
          </p>
        )}

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Reported account
            </p>
            <p className="mt-0.5 truncate text-sm text-neutral-900 dark:text-neutral-100">
              {report.accountName}
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {report.accountEmail}
            </p>
            <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
              {report.storefrontName} · {report.storefrontType}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Reporter
            </p>
            <p className="mt-0.5 truncate text-sm text-neutral-900 dark:text-neutral-100">
              {report.reporterName}
            </p>
            <p className="mt-0.5 text-xs capitalize text-neutral-500 dark:text-neutral-400">
              {report.reporterType}
            </p>
            <time
              dateTime={report.timestamp}
              title={formatAbsolute(report.timestamp)}
              className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400"
            >
              Filed {formatRelative(report.timestamp, now)}
            </time>
          </div>
        </div>

        {report.actionTaken && (
          <div className="mt-3 rounded-md bg-neutral-50 px-3 py-2 text-xs dark:bg-neutral-900/60">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              {report.actionTaken}
            </p>
            {report.resolvedByName && report.resolvedAt && (
              <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
                Resolved by {report.resolvedByName} ·{" "}
                <time
                  dateTime={report.resolvedAt}
                  title={formatAbsolute(report.resolvedAt)}
                >
                  {formatRelative(report.resolvedAt, now)}
                </time>
              </p>
            )}
            {report.adminNote && (
              <p className="mt-1 text-neutral-500 dark:text-neutral-500">
                {report.adminNote}
              </p>
            )}
          </div>
        )}
      </button>

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 px-4 py-2 dark:border-neutral-800">
        <Link
          href={`${routes.orders}?userId=${report.accountId}`}
          className="text-xs text-brand-700 hover:underline dark:text-brand-300"
          onClick={(e) => e.stopPropagation()}
        >
          View orders
        </Link>
        <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-600">
          ·
        </span>
        <Link
          href={`/admin/audit-logs?resourceId=${report.accountId}`}
          className="text-xs text-brand-700 hover:underline dark:text-brand-300"
          onClick={(e) => e.stopPropagation()}
        >
          Audit log
        </Link>

        {isPending && (
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            {actions.map((action) => (
              <Button
                key={action}
                variant={action === "suspend" ? "destructive" : "outline"}
                size="sm"
                onClick={() => onResolve(report, action)}
              >
                {actionLabel(action)}
              </Button>
            ))}
          </div>
        )}

        {!isPending && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <AtlasIcon name="check" className="h-3.5 w-3.5" />
            Closed
          </span>
        )}
      </div>
    </li>
  );
}