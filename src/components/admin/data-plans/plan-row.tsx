"use client";

import { DataPlan } from "@/lib/admin/types/data-plan";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface PlanRowProps {
  plan: DataPlan;
  onEdit: (plan: DataPlan) => void;
  onDuplicate: (plan: DataPlan) => void;
  onDelete: (plan: DataPlan) => void;
  onToggleActive: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
}

export function PlanRow({
  plan,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  isSelected,
  onToggleSelect,
  disableMoveUp,
  disableMoveDown,
}: PlanRowProps) {
  const margin =
    plan.providerCost !== undefined ? plan.price - plan.providerCost : null;
  const marginPercent =
    margin !== null && plan.price > 0 ? (margin / plan.price) * 100 : null;

  const marginColor =
    marginPercent === null
      ? "text-neutral-500"
      : marginPercent >= 15
      ? "text-success-600"
      : marginPercent >= 10
      ? "text-info-600"
      : marginPercent >= 5
      ? "text-warning-600"
      : "text-danger-600";

  return (
    <tr
      className={cn(
        "border-t border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50",
        isSelected && "bg-brand-50/50 dark:bg-brand-900/20"
      )}
    >
      {onToggleSelect && (
        <td className="py-2 pl-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4"
          />
        </td>
      )}

      <td className="py-2 font-medium">{plan.name}</td>
      <td className="py-2 text-sm text-neutral-500">
        {plan.description || "—"}
      </td>
      <td className="py-2 text-sm">{plan.validity || "—"}</td>
      <td className="py-2 text-sm">
        {plan.typeTag ? (
          <Badge variant="info">{plan.typeTag}</Badge>
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </td>
      <td className="py-2 font-semibold">{formatCurrency(plan.price)}</td>
      <td className={cn("py-2 text-xs font-medium", marginColor)}>
        {margin !== null
          ? `${formatCurrency(margin)} (${marginPercent?.toFixed(1)}%)`
          : "—"}
      </td>
      <td className="py-2">
        <Badge variant={plan.active ? "success" : "neutral"}>
          {plan.active ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="py-2 pr-2">
        <div className="flex items-center justify-end gap-1">
          {/* Reorder */}
          <div className="mr-1 flex flex-col">
            <button
              className={cn(
                "text-neutral-400 hover:text-neutral-700 disabled:opacity-30 dark:hover:text-neutral-200",
                disableMoveUp && "pointer-events-none opacity-30"
              )}
              onClick={onMoveUp}
              aria-label="Move up"
            >
              <AtlasIcon name="arrow-up" className="h-3 w-3" />
            </button>
            <button
              className={cn(
                "text-neutral-400 hover:text-neutral-700 disabled:opacity-30 dark:hover:text-neutral-200",
                disableMoveDown && "pointer-events-none opacity-30"
              )}
              onClick={onMoveDown}
              aria-label="Move down"
            >
              <AtlasIcon name="arrow-down" className="h-3 w-3" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(plan.id)}
            title={plan.active ? "Disable" : "Enable"}
          >
            <AtlasIcon
              name={plan.active ? "x-circle" : "check"}
              className={cn(
                "h-4 w-4",
                plan.active ? "text-warning-600" : "text-success-600"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(plan)}
            title="Edit"
          >
            <AtlasIcon name="edit" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(plan)}
            title="Duplicate"
          >
            <AtlasIcon name="link" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(plan)}
            title="Delete"
          >
            <AtlasIcon name="trash" className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      </td>
    </tr>
  );
}