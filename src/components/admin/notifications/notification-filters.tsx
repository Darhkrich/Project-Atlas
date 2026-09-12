// components/admin/notifications/notification-filters.tsx
"use client";

import type { RefObject } from "react";
import { Input } from "@/components/admin/ui/input";
import { Button } from "@/components/admin/ui/button";
import {
  ALL_AUDIENCES,
  ALL_CHANNELS,
  ALL_SECTIONS,
  ALL_STATUSES,
  AUDIENCE_LABEL,
  CHANNEL_LABEL,
  SECTION_LABEL,
  STATUS_LABEL,
} from "@/lib/admin/notifications/constants";

export interface NotificationFilterValues {
  q: string;
  status: string;
  audience: string;
  channel: string;
  section: string;
}

interface NotificationFiltersProps {
  values: NotificationFilterValues;
  hasActive: boolean;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  onChange: (patch: Partial<NotificationFilterValues>) => void;
  onClear: () => void;
}

const selectClass =
  "h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function NotificationFilters({
  values,
  hasActive,
  searchInputRef,
  onChange,
  onClear,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Input
        ref={searchInputRef}
        aria-label="Search notifications"
        placeholder="Search title and message…  (press /)"
        className="max-w-xs"
        value={values.q}
        onChange={(e) => onChange({ q: e.target.value })}
      />

      <select
        aria-label="Filter by status"
        className={selectClass}
        value={values.status}
        onChange={(e) => onChange({ status: e.target.value })}
      >
        <option value="">All statuses</option>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by audience"
        className={selectClass}
        value={values.audience}
        onChange={(e) => onChange({ audience: e.target.value })}
      >
        <option value="">All audiences</option>
        {ALL_AUDIENCES.map((a) => (
          <option key={a} value={a}>
            {AUDIENCE_LABEL[a]}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by channel"
        className={selectClass}
        value={values.channel}
        onChange={(e) => onChange({ channel: e.target.value })}
      >
        <option value="">All channels</option>
        {ALL_CHANNELS.map((c) => (
          <option key={c} value={c}>
            {CHANNEL_LABEL[c]}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by section"
        className={selectClass}
        value={values.section}
        onChange={(e) => onChange({ section: e.target.value })}
      >
        <option value="">All sections</option>
        {ALL_SECTIONS.map((s) => (
          <option key={s} value={s}>
            {SECTION_LABEL[s]}
          </option>
        ))}
      </select>

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}