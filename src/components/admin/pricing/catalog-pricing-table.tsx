"use client";

import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/admin/formatters";
import type { PlanPricingRow } from "@/lib/domains/catalog";

export interface CatalogPricingTableProps {
  rows: PlanPricingRow[];
  sortKey: string;
  sortDirection: "asc" | "desc";
  onSort: (key: string) => void;
  onEdit: (row: PlanPricingRow) => void;
  onViewHistory: (row: PlanPricingRow) => void;
  canManage: boolean;
}

const COLUMNS = [
  { key: "planName", label: "Plan" },
  { key: "categoryName", label: "Category" },
  { key: "network", label: "Network" },
  { key: "providerCost", label: "Provider cost" },
  { key: "atlasPrice", label: "Atlas price" },
  { key: "marginPercent", label: "Margin" },
  { key: "status", label: "Status" },
] as const;

export function CatalogPricingTable({
  rows,
  sortKey,
  sortDirection,
  onSort,
  onEdit,
  onViewHistory,
  canManage,
}: CatalogPricingTableProps) {
  const colSpan = COLUMNS.length + (canManage ? 2 : 1);
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <table className="w-full text-sm">
        <caption className="sr-only">Plan pricing table</caption>
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800">
            {COLUMNS.map((col) => {
              const sorted = sortKey === col.key;
              const ariaSort:
                | "ascending"
                | "descending"
                | "none" = sorted
                ? sortDirection === "asc"
                  ? "ascending"
                  : "descending"
                : "none";
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400"
                >
                  <button
                    type="button"
                    onClick={() => onSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100"
                  >
                    {col.label}
                    {sorted && (
                      <span aria-hidden="true">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
              );
            })}
            {canManage && (
              <th
                scope="col"
                className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                Edit
              </th>
            )}
            <th
              scope="col"
              className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
            >
              History
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={colSpan}
                className="p-6 text-center text-sm text-neutral-500"
              >
                No plans match these filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const negative = row.margin < 0;
              const low = !negative && row.marginPercent < 10;
              return (
                <tr
                  key={row.planId}
                  className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800/60"
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {row.planName}
                    </div>
                    {row.validity && (
                      <div className="text-xs text-neutral-500">
                        {row.validity}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                    {row.categoryName}
                  </td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-400">
                    {row.network ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="tabular-nums">
                      {formatCurrency(row.providerCost)}
                    </div>
                    {row.providerCostInferred && (
                      <div className="text-xs text-warning-700 dark:text-warning-300">
                        inferred
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {formatCurrency(row.atlasPrice)}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    <span
                      className={
                        negative
                          ? "font-medium text-danger-700 dark:text-danger-300"
                          : low
                            ? "text-warning-700 dark:text-warning-300"
                            : ""
                      }
                    >
                      {row.marginPercent.toFixed(1)}%
                    </span>
                    <div className="text-xs text-neutral-500">
                      {formatCurrency(row.margin)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={row.active ? "success" : "neutral"}
                      size="sm"
                    >
                      {row.status}
                    </Badge>
                  </td>
                  {canManage && (
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                        aria-label={"Edit pricing for " + row.planName}
                      >
                        Edit
                      </button>
                    </td>
                  )}
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onViewHistory(row)}
                      className="text-xs font-medium text-neutral-600 hover:underline dark:text-neutral-400"
                      aria-label={"View price history for " + row.planName}
                    >
                      History
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}