"use client";

import { PlanPricing, PLAN_PRICING_STATUS_LABELS } from "@/lib/admin/types/plan-pricing";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface PlanPricingCardProps {
  plan: PlanPricing;
  onEdit: (plan: PlanPricing) => void;
}

export function PlanPricingCard({ plan, onEdit }: PlanPricingCardProps) {
  const margin = plan.atlasPrice - plan.providerCost;
  const marginPercent =
    plan.atlasPrice > 0 ? (margin / plan.atlasPrice) * 100 : 0;

  const marginColor =
    marginPercent >= 15
      ? "bg-success-500"
      : marginPercent >= 10
      ? "bg-info-500"
      : marginPercent >= 5
      ? "bg-warning-500"
      : "bg-danger-500";

  const marginTextColor =
    marginPercent >= 10
      ? "text-success-600"
      : marginPercent >= 5
      ? "text-warning-600"
      : "text-danger-600";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900",
        marginPercent < 10
          ? "border-warning-300 dark:border-warning-800"
          : "border-neutral-200 dark:border-neutral-700"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold">{plan.planName}</h3>
          <p className="text-xs text-neutral-500">
            {plan.serviceCategory}
            {plan.network && ` · ${plan.network}`}
          </p>
        </div>
        <Badge variant={plan.status === "active" ? "success" : "neutral"}>
          {PLAN_PRICING_STATUS_LABELS[plan.status]}
        </Badge>
      </div>

      {/* Low margin warning */}
      {marginPercent < 10 && (
        <div className="mt-2 flex items-center gap-1 rounded-md bg-warning-50 p-1.5 text-xs text-warning-700 dark:bg-warning-900/20 dark:text-warning-300">
          Low margin — review pricing
        </div>
      )}

      {/* Prices */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-neutral-500">Provider Cost</p>
          <p className="font-medium">{formatCurrency(plan.providerCost)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Atlas Price</p>
          <p className="font-medium">{formatCurrency(plan.atlasPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Reseller Price</p>
          <p className="font-medium">{formatCurrency(plan.resellerPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Commission</p>
          <p className="font-medium">{plan.commissionRate}%</p>
        </div>
      </div>

      {/* Margin */}
      <div className="mt-3">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Margin</span>
          <span className={cn("font-semibold", marginTextColor)}>
            {formatCurrency(margin)} ({marginPercent.toFixed(2)}%)
          </span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className={cn("h-2 rounded-full", marginColor)}
            style={{ width: `${Math.min(marginPercent * 4, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          Updated: {new Date(plan.lastUpdated).toLocaleDateString()}
        </span>
        <Button variant="outline" size="sm" onClick={() => onEdit(plan)}>
          Edit
        </Button>
      </div>
    </div>
  );
}