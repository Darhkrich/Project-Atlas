"use client";

import { ServiceCategory } from "@/lib/services-page-data";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface ServiceCategoryCardProps {
  category: ServiceCategory;
  onEdit: (category: ServiceCategory) => void;
  onToggleAvailable: (id: string) => void;
  onDuplicate: (category: ServiceCategory) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function ServiceCategoryCard({
  category,
  onEdit,
  onToggleAvailable,
  onDuplicate,
  isSelected,
  onToggleSelect,
}: ServiceCategoryCardProps) {
  const showNetworks =
    category.filterGroup === "airtime" || category.filterGroup === "data";

  const networkCount = category.networkOptions?.length ?? 0;
  const planCount = category.formConfig?.plans?.length ?? 0;

  const statusVariant = category.available
    ? "success"
    : category.comingSoon
    ? "warning"
    : "neutral";

  const statusLabel = category.available
    ? "Available"
    : category.comingSoon
    ? "Coming Soon"
    : "Inactive";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900",
        isSelected
          ? "border-brand-500 ring-2 ring-brand-500"
          : "border-neutral-200 dark:border-neutral-700"
      )}
    >
      {/* Selection checkbox */}
      {onToggleSelect && (
        <input
          type="checkbox"
          className="absolute left-3 top-3 z-10 h-4 w-4"
          checked={isSelected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <AtlasIcon name={category.icon as AtlasIconName} className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-semibold">{category.name}</h3>
            <p className="text-xs text-neutral-500">{category.description}</p>
          </div>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      {/* Meta */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-neutral-500">Filter Group</p>
          <p className="font-medium capitalize">{category.filterGroup}</p>
        </div>
        <div>
          <p className="text-neutral-500">
            {showNetworks ? "Networks" : "Plans"}
          </p>
          <p className="font-medium">
            {showNetworks ? networkCount : planCount}
          </p>
        </div>
      </div>

      {/* Networks preview */}
      {showNetworks && networkCount > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-neutral-500">Network Options</p>
          <div className="flex flex-wrap gap-1">
            {category.networkOptions?.slice(0, 4).map((net) => (
              <span
                key={net}
                className="rounded bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800"
              >
                {net}
              </span>
            ))}
            {networkCount > 4 && (
              <span className="text-xs text-neutral-500">
                +{networkCount - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Plans preview */}
      {!showNetworks && planCount > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-neutral-500">Plans</p>
          <div className="flex flex-wrap gap-1">
            {category.formConfig?.plans?.slice(0, 3).map((plan) => (
              <span
                key={plan.id}
                className="rounded bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800"
              >
                {plan.name}
              </span>
            ))}
            {planCount > 3 && (
              <span className="text-xs text-neutral-500">
                +{planCount - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleAvailable(category.id)}
        >
          {category.available ? "Disable" : "Enable"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => onDuplicate(category)}
        >
          Duplicate
        </Button>
      </div>
    </div>
  );
}