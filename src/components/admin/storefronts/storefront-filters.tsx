"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  ALL_STOREFRONT_TYPES,
  STOREFRONT_STATUS_LABEL,
  STOREFRONT_TYPE_LABEL,
} from "@/lib/admin/storefronts/storefront-labels";
import type { StorefrontStatus } from "@/lib/admin/types/storefront";

export interface StorefrontFilterValues {
  q: string;
  type: string;
  status: string;
}

interface StorefrontFiltersProps {
  value: StorefrontFilterValues;
  onChange: (patch: Partial<StorefrontFilterValues>) => void;
  onClear: () => void;
  hasActive: boolean;
  searchInputRef: RefObject<HTMLInputElement>;
}

const STATUS_OPTIONS: { value: "" | StorefrontStatus; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "live", label: STOREFRONT_STATUS_LABEL.live },
  { value: "pending", label: STOREFRONT_STATUS_LABEL.pending },
  { value: "disabled", label: STOREFRONT_STATUS_LABEL.disabled },
];

export function StorefrontFilters({
  value,
  onChange,
  onClear,
  hasActive,
  searchInputRef,
}: StorefrontFiltersProps) {
  const chips: { label: string; clear: () => void }[] = [];

  if (value.type) {
    const match = ALL_STOREFRONT_TYPES.find((t) => t === value.type);
    if (match) {
      chips.push({
        label: "Type: " + STOREFRONT_TYPE_LABEL[match],
        clear: () => onChange({ type: "" }),
      });
    }
  }
  if (value.status) {
    const match = STATUS_OPTIONS.find((s) => s.value === value.status);
    if (match) {
      chips.push({
        label: "Status: " + match.label,
        clear: () => onChange({ status: "" }),
      });
    }
  }
  if (value.q.trim()) {
    chips.push({
      label: "Search: " + value.q,
      clear: () => onChange({ q: "" }),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            ref={searchInputRef}
            aria-label="Search storefronts"
            placeholder="Search by storefront, owner, or slug"
            className="pl-9"
            value={value.q}
            onChange={(e) => onChange({ q: e.target.value })}
          />
        </div>

        <select
          aria-label="Filter by type"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={value.type}
          onChange={(e) => onChange({ type: e.target.value })}
        >
          <option value="">All types</option>
          {ALL_STOREFRONT_TYPES.map((t) => (
            <option key={t} value={t}>
              {STOREFRONT_TYPE_LABEL[t]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={value.status}
          onChange={(e) => onChange({ status: e.target.value })}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value || "all"} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>

      {chips.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-wrap gap-2"
        >
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.clear}
                aria-label={"Remove " + chip.label + " filter"}
                className="ml-1 rounded-sm hover:text-danger-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}