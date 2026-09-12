/* eslint-disable react/no-unescaped-entities */
// components/admin/resellers/reseller-filters.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";
import {
  ALL_SORT_KEYS,
  SORT_LABEL,
  STATUS_LABEL,
  VERIFICATION_LABEL,
  type SortKey,
} from "@/lib/admin/resellers/constants";
import type {
  ResellerStatus,
  VerificationStatus,
} from "@/lib/admin/types/reseller";

export interface ResellerFilterValues {
  q: string;
  status: string;
  verification: string;
  tier: string;
  joinedFrom: string;
  joinedTo: string;
  sort: string;
  page: string;
}

interface ResellerFiltersProps {
  value: ResellerFilterValues;
  availableTiers: string[];
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<ResellerFilterValues>) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: { value: "" | ResellerStatus; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "active", label: STATUS_LABEL.active },
  { value: "pending", label: STATUS_LABEL.pending },
  { value: "suspended", label: STATUS_LABEL.suspended },
];

const VERIFICATION_OPTIONS: {
  value: "" | VerificationStatus;
  label: string;
}[] = [
  { value: "", label: "All verification" },
  { value: "verified", label: VERIFICATION_LABEL.verified },
  { value: "pending", label: VERIFICATION_LABEL.pending },
  { value: "rejected", label: VERIFICATION_LABEL.rejected },
  { value: "not_submitted", label: VERIFICATION_LABEL.not_submitted },
];

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function ResellerFilters({
  value,
  availableTiers,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: ResellerFiltersProps) {
  const dateRangeInvalid =
    !!value.joinedFrom &&
    !!value.joinedTo &&
    new Date(value.joinedFrom) > new Date(value.joinedTo);

  const activeChips: { key: string; label: string; clear: () => void }[] = [];

  if (value.status) {
    activeChips.push({
      key: "status",
      label: `Status: ${
        STATUS_LABEL[value.status as ResellerStatus] ?? value.status
      }`,
      clear: () => onChange({ status: "", page: "1" }),
    });
  }
  if (value.verification) {
    activeChips.push({
      key: "verification",
      label: `Verification: ${
        VERIFICATION_LABEL[value.verification as VerificationStatus] ??
        value.verification
      }`,
      clear: () => onChange({ verification: "", page: "1" }),
    });
  }
  if (value.tier) {
    activeChips.push({
      key: "tier",
      label: `Tier: ${value.tier}`,
      clear: () => onChange({ tier: "", page: "1" }),
    });
  }
  if (value.joinedFrom) {
    activeChips.push({
      key: "joinedFrom",
      label: `From: ${value.joinedFrom}`,
      clear: () => onChange({ joinedFrom: "", page: "1" }),
    });
  }
  if (value.joinedTo) {
    activeChips.push({
      key: "joinedTo",
      label: `To: ${value.joinedTo}`,
      clear: () => onChange({ joinedTo: "", page: "1" }),
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={searchInputRef}
          aria-label="Search resellers"
          placeholder="Search business, contact, or email...  (press /)"
          className="max-w-xs"
          value={value.q}
          onChange={(e) => onChange({ q: e.target.value, page: "1" })}
        />

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
          aria-label="Filter by verification"
          className={selectClass}
          value={value.verification}
          onChange={(e) =>
            onChange({ verification: e.target.value, page: "1" })
          }
        >
          {VERIFICATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by tier"
          className={selectClass}
          value={value.tier}
          onChange={(e) => onChange({ tier: e.target.value, page: "1" })}
        >
          <option value="">All tiers</option>
          {availableTiers.map((t) => (
            <option key={t} value={t}>
              {t}
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

        <div className="flex items-center gap-2">
          <label
            htmlFor="reseller-joined-from"
            className="text-xs text-neutral-500 dark:text-neutral-400"
          >
            From
          </label>
          <Input
            id="reseller-joined-from"
            type="date"
            aria-invalid={dateRangeInvalid}
            value={value.joinedFrom}
            onChange={(e) =>
              onChange({ joinedFrom: e.target.value, page: "1" })
            }
            className={cn(
              "h-10 w-36",
              dateRangeInvalid && "border-danger-500"
            )}
          />
          <label
            htmlFor="reseller-joined-to"
            className="text-xs text-neutral-500 dark:text-neutral-400"
          >
            To
          </label>
          <Input
            id="reseller-joined-to"
            type="date"
            aria-invalid={dateRangeInvalid}
            value={value.joinedTo}
            onChange={(e) => onChange({ joinedTo: e.target.value, page: "1" })}
            className={cn(
              "h-10 w-36",
              dateRangeInvalid && "border-danger-500"
            )}
          />
        </div>

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </div>

      {dateRangeInvalid && (
        <p
          role="alert"
          className="text-xs text-danger-600 dark:text-danger-400"
        >
          The "From" date is after the "To" date. No results will match.
        </p>
      )}

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