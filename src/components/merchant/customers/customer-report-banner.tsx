"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { REPORT_REASON_LABELS } from "@/lib/merchant/customers/labels";
import type { CustomerReport } from "@/lib/merchant/customers/types";

interface CustomerReportBannerProps {
  report: CustomerReport;
  onWithdraw: () => void;
}

export function CustomerReportBanner({
  report,
  onWithdraw,
}: CustomerReportBannerProps) {
  const dateText = new Date(report.createdAt).toLocaleDateString("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section
      aria-label="Active customer report"
      className="flex flex-col gap-3 rounded-xl border border-danger-200 bg-danger-50 p-4 dark:border-danger-900 dark:bg-danger-900/20 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-200">
          <AtlasIcon name="alert" className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-danger-900 dark:text-danger-100">
            Reported to Atlas on {dateText}
          </p>
          <p className="mt-0.5 text-xs text-danger-800 dark:text-danger-200">
            Reason: {REPORT_REASON_LABELS[report.reason]}
            {report.note ? " \u00B7 " + report.note : ""}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onWithdraw}
        className="shrink-0 rounded-lg border border-danger-300 bg-white px-3 py-2 text-xs font-medium text-danger-800 hover:bg-danger-100 dark:border-danger-800 dark:bg-neutral-900 dark:text-danger-200 dark:hover:bg-danger-900/40"
      >
        Withdraw report
      </button>
    </section>
  );
}