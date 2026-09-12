// components/admin/audit-logs/audit-log-toolbar.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import {
  ALL_ACTIONS,
  ALL_RESOURCE_KINDS,
  ALL_RESULTS,
  ALL_TIME_RANGES,
  ACTION_LABEL,
  RESOURCE_KIND_LABEL,
  RESULT_LABEL,
  TIME_RANGE_LABEL,
  type AuditTimeRange,
} from "@/lib/admin/audit-logs/constants";
import { ALL_SECTIONS, SECTION_LABEL } from "@/lib/admin/settings/constant";

export interface AuditFilterValues {
  q: string;
  admin: string;
  action: string;
  resourceKind: string;
  section: string;
  result: string;
  range: string;
  resourceId: string;
  page: string;
}

interface AuditLogToolbarProps {
  values: AuditFilterValues;
  admins: { id: string; name: string; email: string }[];
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<AuditFilterValues>) => void;
  onClear: () => void;
}

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function AuditLogToolbar({
  values,
  admins,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: AuditLogToolbarProps) {
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
          aria-label="Search audit logs"
          placeholder="Search actor, resource, values…  (press /)"
          className="max-w-xs"
          value={values.q}
          onChange={(e) => onChange({ q: e.target.value, page: "1" })}
        />

        <select
          aria-label="Filter by actor"
          className={selectClass}
          value={values.admin}
          onChange={(e) => onChange({ admin: e.target.value, page: "1" })}
        >
          <option value="">All actors</option>
          {admins.map((a) => (
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
          {ALL_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABEL[a]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by resource kind"
          className={selectClass}
          value={values.resourceKind}
          onChange={(e) =>
            onChange({ resourceKind: e.target.value, page: "1" })
          }
        >
          <option value="">All resources</option>
          {ALL_RESOURCE_KINDS.map((r) => (
            <option key={r} value={r}>
              {RESOURCE_KIND_LABEL[r]}
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
          aria-label="Filter by result"
          className={selectClass}
          value={values.result}
          onChange={(e) => onChange({ result: e.target.value, page: "1" })}
        >
          <option value="">Any result</option>
          {ALL_RESULTS.map((r) => (
            <option key={r} value={r}>
              {RESULT_LABEL[r]}
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