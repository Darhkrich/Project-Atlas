// components/admin/support/support-filters.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_CHANNELS,
  SUPPORT_STATUSES,
  SUPPORT_USER_TYPES,
  categoryLabel,
  channelLabel,
  statusLabel,
  userTypeLabel,
} from "@/lib/admin/support/constants";
import { SavedViewsBar, type SavedView } from "./saved-views-bar";

export interface SupportFilterValues {
  q: string;
  status: string;
  category: string;
  channel: string;
  userType: string;
  assignee: string;
  view: string;
}

interface SupportFiltersProps {
  values: SupportFilterValues;
  assignees: { id: string; name: string; email: string }[];
  savedViews: SavedView[];
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<SupportFilterValues>) => void;
  onSelectView: (view: SavedView) => void;
  onClear: () => void;
}

export function SupportFilters({
  values,
  assignees,
  savedViews,
  hasActive,
  searchInputRef,
  onChange,
  onSelectView,
  onClear,
}: SupportFiltersProps) {
  const activeViewId = values.view || null;

  return (
    <div className="space-y-3">
      <SavedViewsBar
        views={savedViews}
        activeViewId={activeViewId}
        onSelect={onSelectView}
      />

      <div className="flex flex-wrap gap-2">
        <Input
          ref={searchInputRef}
          aria-label="Search conversations"
          placeholder="Search subject, customer, reference…  (press /)"
          className="max-w-xs"
          value={values.q}
          onChange={(e) => onChange({ q: e.target.value, view: "" })}
        />

        <select
          aria-label="Filter by status"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={values.status}
          onChange={(e) => onChange({ status: e.target.value, view: "" })}
        >
          <option value="">All statuses</option>
          {SUPPORT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by category"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={values.category}
          onChange={(e) => onChange({ category: e.target.value, view: "" })}
        >
          <option value="">All categories</option>
          {SUPPORT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryLabel[c]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by channel"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={values.channel}
          onChange={(e) => onChange({ channel: e.target.value, view: "" })}
        >
          <option value="">All channels</option>
          {SUPPORT_CHANNELS.map((c) => (
            <option key={c} value={c}>
              {channelLabel[c]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by user type"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={values.userType}
          onChange={(e) => onChange({ userType: e.target.value, view: "" })}
        >
          <option value="">All user types</option>
          {SUPPORT_USER_TYPES.map((t) => (
            <option key={t} value={t}>
              {userTypeLabel[t]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by assignee"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={values.assignee}
          onChange={(e) => onChange({ assignee: e.target.value, view: "" })}
        >
          <option value="">All assignees</option>
          <option value="unassigned">Unassigned</option>
          {assignees.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.name}
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