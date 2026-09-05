/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface MerchantSummaryData {
  totalMerchants: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  totalSales: number;
  liveStores: number;
}

export function MerchantSummaryCards({ data }: { data: MerchantSummaryData }) {
  const cards = [
    { label: "Total Merchants", value: data.totalMerchants, icon: "briefcase", color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-900/20" },
    { label: "Active Subscriptions", value: data.activeSubscriptions, icon: "check", color: "text-success-600", bg: "bg-success-50 dark:bg-success-900/20" },
    { label: "Pending Subscriptions", value: data.pendingSubscriptions, icon: "clock", color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-900/20" },
    { label: "Total Sales (GMV)", value: formatCurrency(data.totalSales), icon: "sales", color: "text-info-600", bg: "bg-info-50 dark:bg-info-900/20" },
    { label: "Live Stores", value: data.liveStores, icon: "store", color: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-800" },
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