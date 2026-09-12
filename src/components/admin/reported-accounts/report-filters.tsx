// components/admin/reported-accounts/report-filters.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  ALL_SORT_KEYS,
  CATEGORY_LABEL,
  SORT_LABEL,
  STATUS_LABEL,
  type SortKey,
} from "@/lib/admin/reported-accounts/constants";
import type {
  StorefrontUserReportCategory,
  StorefrontUserReportStatus,
} from "@/lib/admin/types/storefront-user";

export interface ReportFilterValues {
  q: string;
  status: string;
  category: string;
  reporterType: string;
  sort: string;
  page: string;
  pageSize: string;
}

interface ReportFiltersProps {
  value: ReportFilterValues;
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<ReportFilterValues>) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: {
  value: "" | StorefrontUserReportStatus;
  label: string;
}[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: STATUS_LABEL.pending },
  { value: "action_taken", label: STATUS_LABEL.action_taken },
  { value: "dismissed", label: STATUS_LABEL.dismissed },
];

const CATEGORY_OPTIONS: {
  value: "" | StorefrontUserReportCategory;
  label: string;
}[] = [
  { value: "", label: "All categories" },
  { value: "fraud", label: CATEGORY_LABEL.fraud },
  { value: "chargeback", label: CATEGORY_LABEL.chargeback },
  { value: "abuse", label: CATEGORY_LABEL.abuse },
  { value: "spam", label: CATEGORY_LABEL.spam },
  { value: "policy_violation", label: CATEGORY_LABEL.policy_violation },
  { value: "other", label: CATEGORY_LABEL.other },
];

const REPORTER_OPTIONS = [
  { value: "", label: "All reporters" },
  { value: "reseller", label: "Resellers" },
  { value: "merchant", label: "Merchants" },
];

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function ReportFilters({
  value,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: ReportFiltersProps) {
  const activeChips: { key: string; label: string; clear: () => void }[] = [];

  if (value.status) {
    activeChips.push({
      key: "status",
      label: `Status: ${
        STATUS_LABEL[value.status as StorefrontUserReportStatus] ??
        value.status
      }`,
      clear: () => onChange({ status: "", page: "1" }),
    });
  }
  if (value.category) {
    activeChips.push({
      key: "category",
      label: `Category: ${
        CATEGORY_LABEL[value.category as StorefrontUserReportCategory] ??
        value.category
      }`,
      clear: () => onChange({ category: "", page: "1" }),
    });
  }
  if (value.reporterType) {
    activeChips.push({
      key: "reporterType",
      label: `Reporter: ${value.reporterType}`,
      clear: () => onChange({ reporterType: "", page: "1" }),
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
            aria-label="Search reports"
            placeholder="Search by account or reporter...  (press /)"
            className="pl-9"
            value={value.q}
            onChange={(e) => onChange({ q: e.target.value, page: "1" })}
          />
        </div>

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
          aria-label="Filter by category"
          className={selectClass}
          value={value.category}
          onChange={(e) => onChange({ category: e.target.value, page: "1" })}
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by reporter type"
          className={selectClass}
          value={value.reporterType}
          onChange={(e) =>
            onChange({ reporterType: e.target.value, page: "1" })
          }
        >
          {REPORTER_OPTIONS.map((opt) => (
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
          {ALL_SORT_KEYS.map((k) => (
            <option key={k} value={k}>
              {SORT_LABEL[k as SortKey]}
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