"use client";

import { RefundStatus, REFUND_STATUS_LABELS } from "@/lib/admin/types/refund";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

interface PipelineStage {
  status: RefundStatus;
  icon: AtlasIconName;
  color: string;
  count: number;
  amount: number;
}

interface RefundPipelineProps {
  stages: PipelineStage[];
  activeStage: RefundStatus | null;
  onStageClick: (status: RefundStatus | null) => void;
}

export function RefundPipeline({ stages, activeStage, onStageClick }: RefundPipelineProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {stages.map((stage) => {
        const isActive = activeStage === stage.status;
        return (
          <button
            key={stage.status}
            onClick={() => onStageClick(isActive ? null : stage.status)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              isActive
                ? "border-brand-500 bg-brand-50 shadow-md dark:bg-brand-900/20"
                : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
            )}
          >
            <div className="flex items-center justify-between">
              <AtlasIcon name={stage.icon} className={cn("h-5 w-5", stage.color)} />
              {isActive && <span className="h-2 w-2 rounded-full bg-brand-500" />}
            </div>
            <p className="mt-2 text-sm font-semibold">{REFUND_STATUS_LABELS[stage.status]}</p>
            <p className="text-xs text-neutral-500">{stage.count} refunds</p>
            <p className="mt-1 text-sm font-medium">{formatCurrency(stage.amount)}</p>
          </button>
        );
      })}
    </div>
  );
}