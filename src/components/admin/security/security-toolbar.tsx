// components/admin/security/security-toolbar.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  ALL_EVENT_TYPES,
  ALL_SEVERITIES,
  ALL_TIME_RANGES,
  EVENT_TYPE_LABEL,
  SEVERITY_LABEL,
  TIME_RANGE_LABEL,
  type SecurityTimeRange,
} from "@/lib/admin/security/constants";
import type { SecuritySeverity } from "@/lib/admin/types/security";

export interface SecurityFilterValues {
  q: string;
  type: string;
  severity: string;
  range: string;
}

interface SecurityToolbarProps {
  values: SecurityFilterValues;
  resultCount: number;
  totalCount: number;
  lastRefreshed: string;
  refreshing: boolean;
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<SecurityFilterValues>) => void;
  onClear: () => void;
  onRefresh: () => void;
}

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function SecurityToolbar({
  values,
  resultCount,
  totalCount,
  lastRefreshed,
  refreshing,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
  onRefresh,
}: SecurityToolbarProps) {
  const now = useNow();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={searchInputRef}
          aria-label="Search security events"
          placeholder="Search events by user or IP…  (press /)"
          className="max-w-xs"
          value={values.q}
          onChange={(e) => onChange({ q: e.target.value })}
        />

        <select
          aria-label="Filter by event type"
          className={selectClass}
          value={values.type}
          onChange={(e) => onChange({ type: e.target.value })}
        >
          <option value="">All event types</option>
          {ALL_EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {EVENT_TYPE_LABEL[t]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by severity"
          className={selectClass}
          value={values.severity}
          onChange={(e) => onChange({ severity: e.target.value })}
        >
          <option value="">All severities</option>
          {ALL_SEVERITIES.map((s: SecuritySeverity) => (
            <option key={s} value={s}>
              {SEVERITY_LABEL[s]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by time range"
          className={selectClass}
          value={values.range}
          onChange={(e) => onChange({ range: e.target.value })}
        >
          {ALL_TIME_RANGES.map((r: SecurityTimeRange) => (
            <option key={r} value={r}>
              {TIME_RANGE_LABEL[r]}
            </option>
          ))}
        </select>

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Last refresh{" "}
            <time
              dateTime={lastRefreshed}
              title={formatAbsolute(lastRefreshed)}
            >
              {formatRelative(lastRefreshed, now)}
            </time>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <p
        aria-live="polite"
        className="text-xs text-neutral-500 dark:text-neutral-400"
      >
        Showing {resultCount} of {totalCount} events
      </p>
    </div>
  );
}