// components/admin/admin-users/admin-user-filters.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { ALL_ROLES, roleLabel, type Role } from "@/lib/admin/rbac";
import {
  ALL_SORT_KEYS,
  SORT_LABEL,
  type SortKey,
} from "@/lib/admin/admin-users/constants";

export interface AdminUserFilterValues {
  q: string;
  role: string;
  status: string;
  sort: string;
  page: string;
}

interface AdminUserFiltersProps {
  values: AdminUserFilterValues;
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<AdminUserFilterValues>) => void;
  onClear: () => void;
}

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

export function AdminUserFilters({
  values,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: AdminUserFiltersProps) {
  const activeChips: { key: string; label: string; clear: () => void }[] = [];

  if (values.role) {
    activeChips.push({
      key: "role",
      label: `Role: ${roleLabel(values.role as Role)}`,
      clear: () => onChange({ role: "", page: "1" }),
    });
  }
  if (values.status) {
    activeChips.push({
      key: "status",
      label: `Status: ${
        STATUS_OPTIONS.find((s) => s.value === values.status)?.label ??
        values.status
      }`,
      clear: () => onChange({ status: "", page: "1" }),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={searchInputRef}
          aria-label="Search admin users"
          placeholder="Search name or email...  (press /)"
          className="max-w-xs"
          value={values.q}
          onChange={(e) => onChange({ q: e.target.value, page: "1" })}
        />

        <select
          aria-label="Filter by role"
          className={selectClass}
          value={values.role}
          onChange={(e) => onChange({ role: e.target.value, page: "1" })}
        >
          <option value="">All roles</option>
          {ALL_ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          className={selectClass}
          value={values.status}
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
          value={values.sort}
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
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
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