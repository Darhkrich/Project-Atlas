// components/admin/customers/customer-filters.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import {
  ALL_SORT_KEYS,
  LAST_ACTIVE_OPTIONS,
  SORT_LABEL,
  type SortKey,
} from "@/lib/admin/customers/constants";

export interface CustomerFilterValues {
  q: string;
  status: string;
  tag: string;
  risk: string;
  lastActive: string;
  sort: string;
}

interface CustomerFiltersProps {
  value: CustomerFilterValues;
  allTags: string[];
  hasActive: boolean;
  onChange: (next: CustomerFilterValues) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const RISK_OPTIONS = [
  { value: "", label: "All risk levels" },
  { value: "low", label: "Low risk" },
  { value: "medium", label: "Medium risk" },
  { value: "high", label: "High risk" },
];

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function CustomerFilters({
  value,
  allTags,
  hasActive,
  onChange,
  onClear,
}: CustomerFiltersProps) {
  const [searchLocal, setSearchLocal] = useState(value.q);
  const lastFiredRef = useRef(value.q);

  useEffect(() => {
    if (value.q !== lastFiredRef.current) {
      setSearchLocal(value.q);
      lastFiredRef.current = value.q;
    }
  }, [value.q]);

  const debouncedSearch = useDebouncedValue(searchLocal, 300);

  useEffect(() => {
    if (debouncedSearch === lastFiredRef.current) return;
    lastFiredRef.current = debouncedSearch;
    onChange({ ...value, q: debouncedSearch });
  }, [debouncedSearch, value, onChange]);

  const activeChips: { key: string; label: string; clear: () => void }[] = [];

  if (value.status) {
    activeChips.push({
      key: "status",
      label: `Status: ${
        STATUS_OPTIONS.find((s) => s.value === value.status)?.label ??
        value.status
      }`,
      clear: () => onChange({ ...value, status: "" }),
    });
  }
  if (value.tag) {
    activeChips.push({
      key: "tag",
      label: `Tag: ${value.tag}`,
      clear: () => onChange({ ...value, tag: "" }),
    });
  }
  if (value.risk) {
    activeChips.push({
      key: "risk",
      label: `Risk: ${
        RISK_OPTIONS.find((r) => r.value === value.risk)?.label ?? value.risk
      }`,
      clear: () => onChange({ ...value, risk: "" }),
    });
  }
  if (value.lastActive) {
    activeChips.push({
      key: "lastActive",
      label: `Activity: ${
        LAST_ACTIVE_OPTIONS.find((l) => l.value === value.lastActive)?.label ??
        value.lastActive
      }`,
      clear: () => onChange({ ...value, lastActive: "" }),
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
            aria-label="Search customers"
            placeholder="Search by name, email, or phone"
            className="pl-9"
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
          />
        </div>

        <select
          aria-label="Filter by status"
          className={selectClass}
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value })}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by tag"
          className={selectClass}
          value={value.tag}
          onChange={(e) => onChange({ ...value, tag: e.target.value })}
        >
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by risk level"
          className={selectClass}
          value={value.risk}
          onChange={(e) => onChange({ ...value, risk: e.target.value })}
        >
          {RISK_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by last activity"
          className={selectClass}
          value={value.lastActive}
          onChange={(e) => onChange({ ...value, lastActive: e.target.value })}
        >
          {LAST_ACTIVE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort by"
          className={selectClass}
          value={value.sort}
          onChange={(e) => onChange({ ...value, sort: e.target.value })}
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