/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card } from "@/components/admin/ui/card";
import { formatCurrency } from "@/lib/admin/formatters";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { mockPlanPricing } from "@/lib/admin/mock/plan-pricing";

export function PlanPricingSummaryCards() {
  const totalPlans = mockPlanPricing.length;
  const activePlans = mockPlanPricing.filter(p => p.status === "active").length;
  const avgMargin = mockPlanPricing.reduce((sum, p) => {
    const margin = p.atlasPrice - p.providerCost;
    const marginPercent = p.atlasPrice > 0 ? (margin / p.atlasPrice) * 100 : 0;
    return sum + marginPercent;
  }, 0) / Math.max(totalPlans, 1);
  const lowMarginPlans = mockPlanPricing.filter(p => {
    const margin = p.atlasPrice - p.providerCost;
    const marginPercent = p.atlasPrice > 0 ? (margin / p.atlasPrice) * 100 : 0;
    return marginPercent < 10;
  }).length;

  const cards = [
    { label: "Total Plans", value: totalPlans, icon: "grid", color: "text-brand-600", bg: "bg-brand-50 dark:bg-brand-900/20" },
    { label: "Active Plans", value: activePlans, icon: "check", color: "text-success-600", bg: "bg-success-50 dark:bg-success-900/20" },
    { label: "Avg Margin %", value: `${avgMargin.toFixed(1)}%`, icon: "percent", color: "text-info-600", bg: "bg-info-50 dark:bg-info-900/20" },
    { label: "Low Margin Plans", value: lowMarginPlans, icon: "alert", color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-900/20" },
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