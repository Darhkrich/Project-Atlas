// components/admin/services/services-filters.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  ALL_FILTER_GROUPS,
  ALL_SORT_KEYS,
  FILTER_GROUP_LABEL,
  SORT_LABEL,
  STATUS_LABEL,
  type FilterGroup,
  type SortKey,
  type ServiceStatus,
} from "@/lib/admin/services/constants";

export interface ServiceFilterValues {
  q: string;
  status: string;
  group: string;
  sort: string;
  page: string;
  pageSize: string;
}

interface ServicesFiltersProps {
  value: ServiceFilterValues;
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<ServiceFilterValues>) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: { value: "" | ServiceStatus; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "available", label: STATUS_LABEL.available },
  { value: "coming_soon", label: STATUS_LABEL.coming_soon },
  { value: "inactive", label: STATUS_LABEL.inactive },
];

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function ServicesFilters({
  value,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: ServicesFiltersProps) {
  const activeChips: { key: string; label: string; clear: () => void }[] = [];

  if (value.group) {
    activeChips.push({
      key: "group",
      label: `Group: ${
        FILTER_GROUP_LABEL[value.group as FilterGroup] ?? value.group
      }`,
      clear: () => onChange({ group: "", page: "1" }),
    });
  }
  if (value.status) {
    activeChips.push({
      key: "status",
      label: `Status: ${
        STATUS_LABEL[value.status as ServiceStatus] ?? value.status
      }`,
      clear: () => onChange({ status: "", page: "1" }),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            ref={searchInputRef}
            aria-label="Search services"
            placeholder="Search services...  (press /)"
            className="pl-9"
            value={value.q}
            onChange={(e) => onChange({ q: e.target.value, page: "1" })}
          />
        </div>

        <select
          aria-label="Filter by group"
          className={selectClass}
          value={value.group}
          onChange={(e) => onChange({ group: e.target.value, page: "1" })}
        >
          <option value="">All groups</option>
          {ALL_FILTER_GROUPS.map((group) => (
            <option key={group} value={group}>
              {FILTER_GROUP_LABEL[group]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          className={selectClass}
          value={value.status}
          onChange={(e) => onChange({ status: e.target.value, page: "1" })}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort by"
          className={selectClass}
          value={value.sort}
          onChange={(e) => onChange({ sort: e.target.value, page: "1" })}
        >
          {ALL_SORT_KEYS.map((key) => (
            <option key={key} value={key}>
              Sort: {SORT_LABEL[key as SortKey]}
            </option>
          ))}
        </select>

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className={cn(
                "inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              )}
            >
              {chip.label}
              <button
                type="button"
                aria-label={`Clear ${chip.key} filter`}
                onClick={chip.clear}
                className="ml-1 rounded-full px-1 text-brand-600 hover:text-danger-600 dark:text-brand-300 dark:hover:text-danger-400"
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