/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card } from "@/components/admin/ui/card";
import { formatCurrency } from "@/lib/admin/formatters";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface RefundSummaryData {
  pendingCount: number;
  pendingAmount: number;
  approvedToday: number;
  rejectedToday: number;
  totalRefunded: number;
  avgProcessingHours: number;
  highRiskCount: number;
}

export function RefundSummaryCards({ data }: { data: RefundSummaryData }) {
  const cards = [
    {
      label: "Pending Refunds",
      value: `${data.pendingCount}`,
      sub: formatCurrency(data.pendingAmount),
      icon: "file-text",
      accent: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
    },
    {
      label: "Approved Today",
      value: `${data.approvedToday}`,
      sub: "Approvals",
      icon: "check",
      accent: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
    },
    {
      label: "Rejected Today",
      value: `${data.rejectedToday}`,
      sub: "Rejections",
      icon: "x-circle",
      accent: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
    },
    {
      label: "Total Refunded",
      value: formatCurrency(data.totalRefunded),
      sub: "Lifetime",
      icon: "receipt",
      accent: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
    },
    {
      label: "Avg Processing",
      value: `${data.avgProcessingHours}h`,
      sub: "Request to process",
      icon: "clock",
      accent: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
    },
    {
      label: "High Risk Pending",
      value: `${data.highRiskCount}`,
      sub: "Needs attention",
      icon: "shield",
      accent: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={cn("border-0 shadow-sm", card.bg)}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
              <AtlasIcon name={card.icon as any} className={cn("h-5 w-5", card.accent)} />
            </div>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-neutral-500">{card.sub}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}