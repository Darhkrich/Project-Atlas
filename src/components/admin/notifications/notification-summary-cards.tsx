/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface NotificationSummaryData {
  totalSent: number;
  scheduled: number;
  failed: number;
  draft: number;
}

export function NotificationSummaryCards({ data }: { data: NotificationSummaryData }) {
  const cards = [
    { label: "Total Sent", value: data.totalSent, icon: "send", color: "text-success-600", bg: "bg-success-50 dark:bg-success-900/20" },
    { label: "Scheduled", value: data.scheduled, icon: "clock", color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-900/20" },
    { label: "Failed", value: data.failed, icon: "x-circle", color: "text-danger-600", bg: "bg-danger-50 dark:bg-danger-900/20" },
    { label: "Draft", value: data.draft, icon: "file-text", color: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-800" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <Card key={card.label} className={cn("border-0 shadow-sm", card.bg)}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
              <AtlasIcon name={card.icon as any} className={cn("h-5 w-5", card.color)} />
            </div>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}