// components/admin/notifications/notification-summary-cards.tsx
"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { NotificationStatus } from "@/lib/admin/types/notification";

interface NotificationSummaryData {
  totalSent: number;
  scheduled: number;
  failed: number;
  draft: number;
}

interface NotificationSummaryCardsProps {
  data: NotificationSummaryData;
  activeStatus: string;
  onSelect: (status: NotificationStatus | "") => void;
}

interface CardConfig {
  key: string;
  label: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
  status: NotificationStatus;
}

export function NotificationSummaryCards({
  data,
  activeStatus,
  onSelect,
}: NotificationSummaryCardsProps) {
  const cards: CardConfig[] = [
    {
      key: "sent",
      label: "Sent",
      value: data.totalSent,
      icon: "send",
      color: "text-success-600 dark:text-success-400",
      bg: "bg-success-50 dark:bg-success-900/20",
      status: "sent",
    },
    {
      key: "scheduled",
      label: "Scheduled",
      value: data.scheduled,
      icon: "clock",
      color: "text-warning-600 dark:text-warning-400",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      status: "scheduled",
    },
    {
      key: "failed",
      label: "Failed",
      value: data.failed,
      icon: "x-circle",
      color: "text-danger-600 dark:text-danger-400",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      status: "failed",
    },
    {
      key: "draft",
      label: "Draft",
      value: data.draft,
      icon: "file-text",
      color: "text-neutral-600 dark:text-neutral-300",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      status: "draft",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const isActive = activeStatus === card.status;
        return (
          <button
            key={card.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? "" : card.status)}
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Card
              className={cn(
                "border-0 shadow-sm transition-shadow hover:shadow-md",
                card.bg,
                isActive && "ring-2 ring-brand-500"
              )}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    {card.label}
                  </p>
                  <AtlasIcon name={card.icon} className={cn("h-5 w-5", card.color)} />
                </div>
                <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {card.value.toLocaleString("en-GH")}
                </p>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}