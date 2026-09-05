/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface CustomerSummaryData {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  totalSpent: number;
  avgOrderValue: number;
}

export function CustomerSummaryCards({ data }: { data: CustomerSummaryData }) {
  const cards = [
    { label: "Total Customers", value: data.totalCustomers.toLocaleString(), icon: "users", color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-900/20" },
    { label: "Active (30d)", value: data.activeCustomers.toLocaleString(), icon: "user", color: "text-success-600", bg: "bg-success-50 dark:bg-success-900/20" },
    { label: "New This Month", value: data.newThisMonth.toLocaleString(), icon: "plus", color: "text-info-600", bg: "bg-info-50 dark:bg-info-900/20" },
    { label: "Total Spent", value: formatCurrency(data.totalSpent), icon: "sales", color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-900/20" },
    { label: "Avg Order Value", value: formatCurrency(data.avgOrderValue), icon: "receipt", color: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-800" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
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