// components/admin/support/bulk-actions-bar.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { AssigneePicker } from "@/components/admin/ui/assignee-picker";
import {
  SUPPORT_PRIORITIES,
  priorityLabel,
} from "@/lib/admin/support/constants";
import type { SupportPriority } from "@/lib/admin/types/support";

type BulkActionKind =
  | "assign"
  | "priority"
  | "tag"
  | "snooze"
  | "resolve"
  | "close";

export interface BulkSelectionSummary {
  count: number;
  unreadCount: number;
}

interface BulkActionsBarProps {
  summary: BulkSelectionSummary;
  currentAdminName: string;
  onAssign: (adminId: string) => void;
  onAssignToMe: () => void;
  onPriority: (priority: SupportPriority) => void;
  onTag: (tag: string) => void;
  onSnooze: (untilIso: string) => void;
  onResolve: () => void;
  onClose: () => void;
  onMerge: () => void;
  onClear: () => void;
}

const TAG_PRESETS = [
  "escalated",
  "vip",
  "follow-up",
  "provider-issue",
  "refund-pending",
];

const SNOOZE_PRESETS: { label: string; minutes: number }[] = [
  { label: "1 hour", minutes: 60 },
  { label: "4 hours", minutes: 240 },
  { label: "Tomorrow", minutes: 60 * 24 },
  { label: "Next week", minutes: 60 * 24 * 7 },
];

export function BulkActionsBar({
  summary,
  currentAdminName,
  onAssign,
  onAssignToMe,
  onPriority,
  onTag,
  onSnooze,
  onResolve,
  onClose,
  onMerge,
  onClear,
}: BulkActionsBarProps) {
  const [open, setOpen] = useState<BulkActionKind | null>(null);

  const label = useMemo(() => {
    const noun = summary.count === 1 ? "conversation" : "conversations";
    if (summary.unreadCount === 0) {
      return summary.count + " " + noun + " selected";
    }
    return (
      summary.count +
      " " +
      noun +
      " selected \u00B7 " +
      summary.unreadCount +
      " unread"
    );
  }, [summary]);

  const mergeEnabled = summary.count >= 2;

  return (
    <div
      className="space-y-2 rounded-lg border border-brand-200 bg-brand-50/60 p-2 dark:border-brand-800/60 dark:bg-brand-900/20"
      role="region"
      aria-label="Bulk actions"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium" aria-live="polite">
          {label}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAssignToMe}>
            Assign to me ({currentAdminName})
          </Button>

          <Button
            variant={open === "assign" ? "primary" : "outline"}
            size="sm"
            aria-expanded={open === "assign"}
            onClick={() => setOpen(open === "assign" ? null : "assign")}
          >
            Assign
          </Button>

          <Button
            variant={open === "priority" ? "primary" : "outline"}
            size="sm"
            aria-expanded={open === "priority"}
            onClick={() => setOpen(open === "priority" ? null : "priority")}
          >
            Priority
          </Button>

          <Button
            variant={open === "tag" ? "primary" : "outline"}
            size="sm"
            aria-expanded={open === "tag"}
            onClick={() => setOpen(open === "tag" ? null : "tag")}
          >
            Tag
          </Button>

          <Button
            variant={open === "snooze" ? "primary" : "outline"}
            size="sm"
            aria-expanded={open === "snooze"}
            onClick={() => setOpen(open === "snooze" ? null : "snooze")}
          >
            Snooze
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={!mergeEnabled}
            title={
              mergeEnabled
                ? "Merge selected conversations"
                : "Select at least 2 conversations to merge"
            }
            onClick={onMerge}
          >
            Merge
          </Button>

          <Button variant="outline" size="sm" onClick={onResolve}>
            Resolve
          </Button>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close tickets
          </Button>

          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear selection
          </Button>
        </div>
      </div>

      {open === "assign" && (
        <div className="flex items-center gap-2 border-t border-brand-200 pt-2 dark:border-brand-800/60">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            Assign selected to
          </span>
          <div className="w-64">
            <AssigneePicker
              onChange={(adminId) => {
                if (!adminId) return;
                onAssign(adminId);
                setOpen(null);
              }}
            />
          </div>
        </div>
      )}

      {open === "priority" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-brand-200 pt-2 dark:border-brand-800/60">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            Set priority to
          </span>
          {SUPPORT_PRIORITIES.map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              onClick={() => {
                onPriority(p);
                setOpen(null);
              }}
            >
              {priorityLabel[p]}
            </Button>
          ))}
        </div>
      )}

      {open === "tag" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-brand-200 pt-2 dark:border-brand-800/60">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            Apply tag
          </span>
          {TAG_PRESETS.map((tag) => (
            <Button
              key={tag}
              variant="outline"
              size="sm"
              onClick={() => {
                onTag(tag);
                setOpen(null);
              }}
            >
              {tag}
            </Button>
          ))}
        </div>
      )}

      {open === "snooze" && (
        <div className="flex flex-wrap items-center gap-2 border-t border-brand-200 pt-2 dark:border-brand-800/60">
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            Snooze until
          </span>
          {SNOOZE_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => {
                const untilIso = new Date(
                  Date.now() + preset.minutes * 60_000
                ).toISOString();
                onSnooze(untilIso);
                setOpen(null);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}