"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { CATEGORY_LABEL } from "@/lib/domains/catalog";

export interface CatalogPricingFilterValues {
  q: string;
  category: string;
  network: string;
  status: string;
  lowMargin: string;
  sort: string;
  page: string;
  pageSize: string;
}

export const DEFAULT_CATALOG_PRICING_FILTERS: CatalogPricingFilterValues = {
  q: "",
  category: "",
  network: "",
  status: "",
  lowMargin: "",
  sort: "category",
  page: "1",
  pageSize: "24",
};

export function CatalogPricingFilters({
  value,
  onChange,
  onClear,
  hasActive,
  categoryIds,
  networkNames,
  searchInputRef,
}: {
  value: CatalogPricingFilterValues;
  onChange: (patch: Partial<CatalogPricingFilterValues>) => void;
  onClear: () => void;
  hasActive: boolean;
  categoryIds: string[];
  networkNames: string[];
  searchInputRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        ref={searchInputRef}
        placeholder="Search plans"
        aria-label="Search plans"
        className="max-w-xs"
        value={value.q}
        onChange={(e) => onChange({ q: e.target.value, page: "1" })}
      />
      <select
        aria-label="Filter by10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        value={value.category}
        onChange={(e) =>
          onChange({ category: e.target.value, page: "1" })
        }
      >
        <option value="">All categories</option>
        {categoryIds.map((id) => (
          <option key={id} value={id}>
            {CATEGORY_LABEL[id] ?? id}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by network"
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        value={value.network}
        onChange={(e) => onChange({ network: e.target.value, page: "1" })}
      >
        <option value="">All networks</option>
        {networkNames.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by status"
        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
        value={value.status}
        onChange={(e) => onChange({ status: e.target.value, page: "1" })}
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button
        type="button"
        aria-pressed={value.lowMargin === "1"}
        onClick={() =>
          onChange({
            lowMargin: value.lowMargin === "1" ? "" : "1",
            page: "1",
          })
        }
        className={
          "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium " +
          (value.lowMargin === "1"
            ? "bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300"
            : "border border-neutral-300 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400")
        }
      >
        Low margin only
        {value.lowMargin === "1" && (
          <span aria-hidden="true"> x</span>
        )}
      </button>
      {hasActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}