"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/admin/formatters";
import type { RefundStatus } from "@/lib/admin/types/refund";
import type { RefundPipelineView } from "@/lib/admin/refunds/refunds-projection";

interface OrderRefundsPipelineProps {
  pipeline: RefundPipelineView;
  activeStatus: RefundStatus | null;
  onStatusChange: (status: RefundStatus | null) => void;
}

export function OrderRefundsPipeline({
  pipeline,
  activeStatus,
  onStatusChange,
}: OrderRefundsPipelineProps) {
  return (
    <div
      role="region"
      aria-label="Refund pipeline"
      className="grid grid-cols-2 gap-3 md:grid-cols-5"
    >
      {pipeline.stages.map((stage) => {
        const isActive = activeStatus === stage.status;
        return (
          <button
            key={stage.status}
            type="button"
            aria-pressed={isActive}
            aria-label={
              stage.label +
              ": " +
              stage.count +
              " refunds, " +
              formatCurrency(stage.amount)
            }
            onClick={() => onStatusChange(isActive ? null : stage.status)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              isActive
                ? "border-brand-500 bg-brand-50 shadow-md dark:bg-brand-900/20"
                : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-neutral-500">
                {stage.label}
              </p>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-brand-500"
                />
              )}
            </div>
            <p className="mt-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {stage.count}
            </p>
            <p className="text-xs text-neutral-500">
              {formatCurrency(stage.amount)}
            </p>
          </button>
        );
      })}
    </div>
  );
}