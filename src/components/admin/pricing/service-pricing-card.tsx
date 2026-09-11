"use client";

import {
  ServicePricing,
  SERVICE_CATEGORIES,
  SERVICE_STATUS_LABELS,
} from "@/lib/admin/types/pricing";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface ServicePricingCardProps {
  service: ServicePricing;
  onEdit: (service: ServicePricing) => void;
}

export function ServicePricingCard({ service, onEdit }: ServicePricingCardProps) {
  const margin = service.atlasPrice - service.providerCost;
  const marginPercent =
    service.atlasPrice > 0 ? (margin / service.atlasPrice) * 100 : 0;

  const marginColor =
    marginPercent >= 15
      ? "bg-success-500"
      : marginPercent >= 10
      ? "bg-info-500"
      : marginPercent >= 5
      ? "bg-warning-500"
      : "bg-danger-500";

  const marginTextColor =
    marginPercent >= 10 ? "text-success-600" : marginPercent >= 5 ? "text-warning-600" : "text-danger-600";

  const statusVariant =
    service.status === "active"
      ? "success"
      : service.status === "maintenance"
      ? "warning"
      : "neutral";

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
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <AtlasIcon name="grid" className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold">{service.serviceName}</h3>
            <p className="text-xs text-neutral-500">
              {SERVICE_CATEGORIES.find((c) => c.value === service.category)?.label}
            </p>
          </div>
        </div>
        <Badge variant={statusVariant}>{SERVICE_STATUS_LABELS[service.status]}</Badge>
      </div>

      {/* Low margin warning */}
      {marginPercent < 10 && (
        <div className="mt-2 flex items-center gap-1 rounded-md bg-warning-50 p-1.5 text-xs text-warning-700 dark:bg-warning-900/20 dark:text-warning-300">
          <AtlasIcon name="alert" className="h-3 w-3" />
          Low margin — review pricing
        </div>
      )}

      {/* Prices */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-xs text-neutral-500">Provider</p>
          <p className="font-medium">{formatCurrency(service.providerCost)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Atlas</p>
          <p className="font-medium">{formatCurrency(service.atlasPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Reseller</p>
          <p className="font-medium">{formatCurrency(service.resellerPrice)}</p>
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

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          Commission: {service.commissionRate}%
        </span>
        <Button variant="outline" size="sm" onClick={() => onEdit(service)}>
          Edit
        </Button>
      </div>
    </div>
  );
}