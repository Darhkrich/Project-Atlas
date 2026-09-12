"use client";

import { useState } from "react";
import type { DataPlan } from "@/lib/admin/types/data-plan";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";
import { computeMargin } from "@/lib/admin/data-plans/helpers";
import {
  marginBand,
  MARGIN_BAND_TEXT_CLASS,
  STATUS_LABEL,
  STATUS_VARIANT,
  planStatus,
} from "@/lib/admin/data-plans/constants";

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
  const [menuOpen, setMenuOpen] = useState(false);

  const margin = computeMargin(plan);
  const marginTextClass = margin
    ? MARGIN_BAND_TEXT_CLASS[marginBand(margin.percent)]
    : "text-neutral-500 dark:text-neutral-400";

  const status = planStatus(plan.active);

  return (
    <tr
      data-plan-id={plan.id}
      tabIndex={-1}
      className={cn(
        "border-t border-neutral-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800",
        isSelected && "bg-brand-50/50 dark:bg-brand-900/20"
      )}
    >
      {onToggleSelect && (
        <td className="py-2 pl-2">
          <input
            type="checkbox"
            checked={isSelected ?? false}
            onChange={onToggleSelect}
            aria-label={`Select ${plan.name}`}
            className="h-4 w-4 focus-visible:ring-2 focus-visible:ring-brand-500"
          />
        </td>
      )}

      <td className="py-2 font-medium">{plan.name}</td>
      <td className="py-2 text-sm text-neutral-500 dark:text-neutral-400">
        {plan.description || "—"}
      </td>
      <td className="py-2 text-sm">{plan.validity || "—"}</td>
      <td className="py-2 text-sm">
        {plan.typeTag ? (
          <Badge variant="info" size="sm">
            {plan.typeTag}
          </Badge>
        ) : (
          <span className="text-neutral-400">—</span>
        )}
      </td>
      <td className="py-2 font-semibold">{formatCurrency(plan.price)}</td>
      <td className={cn("py-2 text-xs font-medium", marginTextClass)}>
        {margin
          ? `${formatCurrency(margin.absolute)} (${margin.percent.toFixed(1)}%)`
          : "—"}
      </td>
      <td className="py-2">
        <Badge variant={STATUS_VARIANT[status]} size="sm">
          {STATUS_LABEL[status]}
        </Badge>
      </td>
      <td className="py-2 pr-2">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleActive(plan.id)}
            aria-label={
              status === "active" ? `Disable ${plan.name}` : `Enable ${plan.name}`
            }
          >
            <AtlasIcon
              name={status === "active" ? "x-circle" : "check"}
              aria-hidden="true"
              className={cn(
                "h-4 w-4",
                status === "active" ? "text-warning-600" : "text-success-600"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(plan)}
            aria-label={`Edit ${plan.name}`}
          >
            <AtlasIcon name="edit" aria-hidden="true" className="h-4 w-4" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`More actions for ${plan.name}`}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <AtlasIcon
                name="more"
                aria-hidden="true"
                className="h-4 w-4"
              />
            </Button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  tabIndex={-1}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-30 cursor-default"
                />
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-1 w-44 rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <button
                    type="button"
                    role="menuitem"
                    disabled={disableMoveUp}
                    onClick={() => {
                      onMoveUp();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-neutral-800"
                  >
                    <AtlasIcon
                      name="arrow-up"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    />
                    Move up
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={disableMoveDown}
                    onClick={() => {
                      onMoveDown();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-neutral-800"
                  >
                    <AtlasIcon
                      name="arrow-down"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    />
                    Move down
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onDuplicate(plan);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <AtlasIcon
                      name="copy"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    />
                    Duplicate
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onDelete(plan);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/30"
                  >
                    <AtlasIcon
                      name="trash"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}