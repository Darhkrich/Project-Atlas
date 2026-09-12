// components/admin/reported-accounts/report-summary-cards.tsx
"use client";

import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

export interface ReportSummaryData {
  total: number;
  pending: number;
  pendingPastSla: number;
  actionTaken: number;
  dismissed: number;
}

interface ReportSummaryCardsProps {
  data: ReportSummaryData;
  activeStatus: string;
  onFilterAll: () => void;
  onFilterPending: () => void;
  onFilterActionTaken: () => void;
  onFilterDismissed: () => void;
}

interface CardConfig {
  key: string;
  label: string;
  value: number;
  sub: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  isActive: boolean;
  highlight?: boolean;
  onClick: () => void;
}

export function ReportSummaryCards({
  data,
  activeStatus,
  onFilterAll,
  onFilterPending,
  onFilterActionTaken,
  onFilterDismissed,
}: ReportSummaryCardsProps) {
  const cards: CardConfig[] = [
    {
      key: "total",
      label: "Total reports",
      value: data.total,
      sub: "All time",
      icon: "alert-triangle",
      color: "text-brand-600 dark:text-brand-400",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      isActive: activeStatus === "",
      onClick: onFilterAll,
    },
    {
      key: "pending",
      label: "Pending",
      value: data.pending,
      sub:
        data.pendingPastSla > 0
          ? `${data.pendingPastSla} past SLA`
          : "Awaiting review",
      icon: "clock",
      color:
        data.pendingPastSla > 0
          ? "text-danger-600 dark:text-danger-400"
          : "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      isActive: activeStatus === "pending",
      highlight: data.pendingPastSla > 0,
      onClick: onFilterPending,
    },
    {
      key: "action_taken",
      label: "Action taken",
      value: data.actionTaken,
      sub: "Resolved with action",
      icon: "check-circle",
      color: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-success-900/20",
      isActive: activeStatus === "action_taken",
      onClick: onFilterActionTaken,
    },
    {
      key: "dismissed",
      label: "Dismissed",
      value: data.dismissed,
      sub: "Closed without action",
      icon: "x-circle",
      color: "text-neutral-600 dark:text-neutral-300",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      isActive: activeStatus === "dismissed",
      onClick: onFilterDismissed,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          aria-pressed={card.isActive}
          onClick={card.onClick}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <div
            className={cn(
              "rounded-lg border-0 p-4 shadow-sm transition-shadow hover:shadow-md",
              card.bg,
              card.isActive && "ring-2 ring-brand-500",
              card.highlight &&
                !card.isActive &&
                "ring-1 ring-danger-300 dark:ring-danger-800"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                {card.label}
              </p>
              <AtlasIcon
                name={card.icon}
                className={cn("h-4 w-4", card.color)}
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {card.value}
            </p>
            <p
              className={cn(
                "text-xs",
                card.highlight && !card.isActive
                  ? "text-danger-700 dark:text-danger-300"
                  : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              {card.sub}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}