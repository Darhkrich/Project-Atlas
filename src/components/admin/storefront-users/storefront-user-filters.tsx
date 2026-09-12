// components/admin/storefront-users/storefront-user-filters.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  ALL_SORT_KEYS,
  RISK_LABEL,
  SORT_LABEL,
  STATUS_LABEL,
  type SortKey,
} from "@/lib/admin/storefront-users/constants";
import type {
  StorefrontUserRiskLevel,
  StorefrontUserStatus,
} from "@/lib/admin/types/storefront-user";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";

export interface StorefrontUserFilterValues {
  q: string;
  storefrontId: string;
  status: string;
  risk: string;
  tag: string;
  sort: string;
  page: string;
  pageSize: string;
}

interface StorefrontUserFiltersProps {
  value: StorefrontUserFilterValues;
  storefronts: UnifiedStorefront[];
  availableTags: string[];
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<StorefrontUserFilterValues>) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: { value: "" | StorefrontUserStatus; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "active", label: STATUS_LABEL.active },
  { value: "inactive", label: STATUS_LABEL.inactive },
  { value: "suspended", label: STATUS_LABEL.suspended },
];

const RISK_OPTIONS: { value: "" | StorefrontUserRiskLevel; label: string }[] = [
  { value: "", label: "All risk levels" },
  { value: "low", label: RISK_LABEL.low },
  { value: "medium", label: RISK_LABEL.medium },
  { value: "high", label: RISK_LABEL.high },
];

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function StorefrontUserFilters({
  value,
  storefronts,
  availableTags,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: StorefrontUserFiltersProps) {
  const activeChips: { key: string; label: string; clear: () => void }[] = [];

  if (value.storefrontId) {
    const sf = storefronts.find((s) => s.id === value.storefrontId);
    activeChips.push({
      key: "storefront",
      label: `Storefront: ${sf?.storeName ?? value.storefrontId}`,
      clear: () => onChange({ storefrontId: "", page: "1" }),
    });
  }
  if (value.status) {
    activeChips.push({
      key: "status",
      label: `Status: ${
        STATUS_LABEL[value.status as StorefrontUserStatus] ?? value.status
      }`,
      clear: () => onChange({ status: "", page: "1" }),
    });
  }
  if (value.risk) {
    activeChips.push({
      key: "risk",
      label: `Risk: ${
        RISK_LABEL[value.risk as StorefrontUserRiskLevel] ?? value.risk
      }`,
      clear: () => onChange({ risk: "", page: "1" }),
    });
  }
  if (value.tag) {
    activeChips.push({
      key: "tag",
      label: `Tag: ${value.tag}`,
      clear: () => onChange({ tag: "", page: "1" }),
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
            aria-label="Search storefront users"
            placeholder="Search name, email, or phone...  (press /)"
            className="pl-9"
            value={value.q}
            onChange={(e) => onChange({ q: e.target.value, page: "1" })}
          />
        </div>

        <select
          aria-label="Filter by storefront"
          className={selectClass}
          value={value.storefrontId}
          onChange={(e) =>
            onChange({ storefrontId: e.target.value, page: "1" })
          }
        >
          <option value="">All storefronts</option>
          {storefronts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.storeName} · {s.ownerName}
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
          aria-label="Filter by risk"
          className={selectClass}
          value={value.risk}
          onChange={(e) => onChange({ risk: e.target.value, page: "1" })}
        >
          {RISK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by tag"
          className={selectClass}
          value={value.tag}
          onChange={(e) => onChange({ tag: e.target.value, page: "1" })}
        >
          <option value="">All tags</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
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
              Sort: {SORT_LABEL[k as SortKey]}
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