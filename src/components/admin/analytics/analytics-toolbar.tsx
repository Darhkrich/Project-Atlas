// components/admin/analytics/analytics-toolbar.tsx
"use client";

import { Button } from "@/components/admin/ui/button";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  ALL_DATE_RANGES,
  ALL_GRANULARITIES,
  ALL_SEGMENTS,
  COMPARISON_LABEL,
  DATE_RANGE_LABEL,
  GRANULARITY_LABEL,
  SECTION_FILTER_LABEL,
  SEGMENT_LABEL,
} from "@/lib/admin/analytics/contants";
import type {
  AnalyticsSegment,
  DateRangeKey,
  Granularity,
} from "@/lib/admin/types/analytics";
import type { AtlasSection } from "@/lib/admin/types/settings";

export interface AnalyticsFilterValues {
  range: string;
  segment: string;
  section: string;
  granularity: string;
  compare: string;
}

interface AnalyticsToolbarProps {
  values: AnalyticsFilterValues;
  lastUpdated: string;
  refreshing: boolean;
  onChange: (patch: Partial<AnalyticsFilterValues>) => void;
  onRefresh: () => void;
}

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function AnalyticsToolbar({
  values,
  lastUpdated,
  refreshing,
  onChange,
  onRefresh,
}: AnalyticsToolbarProps) {
  const now = useNow();
  const comparing = values.compare === "true";
  const range = values.range as DateRangeKey;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Date range"
        className={selectClass}
        value={values.range}
        onChange={(e) => onChange({ range: e.target.value })}
      >
        {ALL_DATE_RANGES.map((r) => (
          <option key={r} value={r}>
            {DATE_RANGE_LABEL[r]}
          </option>
        ))}
      </select>

      <select
        aria-label="Segment"
        className={selectClass}
        value={values.segment}
        onChange={(e) => onChange({ segment: e.target.value })}
      >
        {ALL_SEGMENTS.map((s) => (
          <option key={s} value={s}>
            {SEGMENT_LABEL[s as AnalyticsSegment]}
          </option>
        ))}
      </select>

      <select
        aria-label="Section"
        className={selectClass}
        value={values.section}
        onChange={(e) => onChange({ section: e.target.value })}
      >
        {(["all", "digital_services", "resellers", "ecommerce"] as const).map(
          (s) => (
            <option key={s} value={s}>
              {SECTION_FILTER_LABEL[s]}
            </option>
          )
        )}
      </select>

      <select
        aria-label="Granularity"
        className={selectClass}
        value={values.granularity}
        onChange={(e) => onChange({ granularity: e.target.value })}
      >
        {ALL_GRANULARITIES.map((g) => (
          <option key={g} value={g}>
            {GRANULARITY_LABEL[g as Granularity]}
          </option>
        ))}
      </select>

      <button
        type="button"
        aria-pressed={comparing}
        onClick={() => onChange({ compare: comparing ? "false" : "true" })}
        className={
          comparing
            ? "h-10 rounded-md border border-brand-500 bg-brand-50 px-3 text-sm font-medium text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-200"
            : "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/60"
        }
      >
        {comparing
          ? `Comparing ${COMPARISON_LABEL[range]}`
          : "Compare prior period"}
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Updated{" "}
          <time
            dateTime={lastUpdated}
            title={formatAbsolute(lastUpdated)}
          >
            {formatRelative(lastUpdated, now)}
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
  );
}