// components/admin/audit-logs/financial-audit-toolbar.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import {
  ALL_TIME_RANGES,
  TIME_RANGE_LABEL,
  type AuditTimeRange,
} from "@/lib/admin/audit-logs/constants";
import {
  ALL_FINANCIAL_ACTIONS,
  ALL_FINANCIAL_RESOURCE_TYPES,
  FINANCIAL_ACTION_LABEL,
  FINANCIAL_RESOURCE_LABEL,
} from "@/lib/admin/audit-logs/financial-labels";
import { ALL_SECTIONS, SECTION_LABEL } from "@/lib/admin/settings/constant";

export interface FinancialAuditFilterValues {
  q: string;
  actor: string;
  action: string;
  resourceType: string;
  section: string;
  range: string;
  resourceId: string;
  page: string;
}

interface FinancialAuditToolbarProps {
  values: FinancialAuditFilterValues;
  actors: { id: string; name: string; email: string }[];
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<FinancialAuditFilterValues>) => void;
  onClear: () => void;
}

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function FinancialAuditToolbar({
  values,
  actors,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: FinancialAuditToolbarProps) {
  return (
    <div className="space-y-3">
      {values.resourceId && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-xs dark:border-brand-800/60 dark:bg-brand-900/20">
          <span className="text-brand-900 dark:text-brand-100">
            Filtered to resource{" "}
            <span className="font-mono">{values.resourceId}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ resourceId: "", page: "1" })}
          >
            Clear
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Input
          ref={searchInputRef}
          aria-label="Search financial audit entries"
          placeholder="Search actor, resource, or value"
          className="max-w-xs"
          value={values.q}
          onChange={(e) => onChange({ q: e.target.value, page: "1" })}
        />

        <select
          aria-label="Filter by actor"
          className={selectClass}
          value={values.actor}
          onChange={(e) => onChange({ actor: e.target.value, page: "1" })}
        >
          <option value="">All actors</option>
          {actors.map((a) => (
            <option key={a.id} value={a.email}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by action"
          className={selectClass}
          value={values.action}
          onChange={(e) => onChange({ action: e.target.value, page: "1" })}
        >
          <option value="">All actions</option>
          {ALL_FINANCIAL_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {FINANCIAL_ACTION_LABEL[a]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by resource type"
          className={selectClass}
          value={values.resourceType}
          onChange={(e) =>
            onChange({ resourceType: e.target.value, page: "1" })
          }
        >
          <option value="">All resource types</option>
          {ALL_FINANCIAL_RESOURCE_TYPES.map((r) => (
            <option key={r} value={r}>
              {FINANCIAL_RESOURCE_LABEL[r]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by section"
          className={selectClass}
          value={values.section}
          onChange={(e) => onChange({ section: e.target.value, page: "1" })}
        >
          <option value="">All sections</option>
          {ALL_SECTIONS.map((s) => (
            <option key={s} value={s}>
              {SECTION_LABEL[s]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by time range"
          className={selectClass}
          value={values.range}
          onChange={(e) => onChange({ range: e.target.value, page: "1" })}
        >
          {ALL_TIME_RANGES.map((r: AuditTimeRange) => (
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
      </div>
    </div>
  );
}