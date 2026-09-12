// components/admin/support/support-row.tsx
"use client";

import { Badge } from "@/components/admin/ui/badge";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { SlaIndicator } from "@/components/admin/ui/sla-indicator";
import { cn } from "@/lib/utils";
import {
  priorityLabel,
  priorityVariant,
  statusLabel,
  statusVariant,
  userTypeLabel,
} from "@/lib/admin/support/constants";
import { summarizeEntity } from "@/lib/admin/support/status-styles";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import type { SupportConversation } from "@/lib/admin/types/support";

interface SupportRowProps {
  conversation: SupportConversation;
  selected: boolean;
  focused: boolean;
  now: number | null;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onFocus: (id: string) => void;
}

export function SupportRow({
  conversation,
  selected,
  focused,
  now,
  onToggleSelect,
  onOpen,
  onFocus,
}: SupportRowProps) {
  const c = conversation;
  const summary = c.linkedEntity ? summarizeEntity(c.linkedEntity) : null;

  return (
    <li
      data-conversation-id={c.id}
      onMouseEnter={() => onFocus(c.id)}
      className={cn(
        "flex items-stretch gap-3 rounded-lg border bg-white px-3 py-3 transition-colors dark:bg-neutral-900",
        selected
          ? "border-brand-400 bg-brand-50/40 dark:border-brand-700 dark:bg-brand-900/20"
          : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/60",
        focused && !selected && "ring-1 ring-brand-300 dark:ring-brand-800"
      )}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(c.id)}
          className="h-4 w-4 shrink-0"
          aria-label={`Select conversation: ${c.subject}`}
        />
      </div>

      <button
        type="button"
        onClick={() => onOpen(c.id)}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {c.subject}
            </p>
            {c.unreadCount > 0 && (
              <Badge variant="danger">{c.unreadCount} new</Badge>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="truncate font-medium text-neutral-700 dark:text-neutral-300">
              {c.userName}
            </span>
            <Badge variant="brand" size="sm">
              {userTypeLabel[c.userType]}
            </Badge>
            {c.ticketRef && (
              <span className="truncate text-neutral-400 dark:text-neutral-500">
                {c.ticketRef}
              </span>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            {summary && (
              <>
                <span className="flex min-w-0 items-center gap-1.5">
                  <StatusDot tone={toneFromDot(summary.dotClass)} size="sm" />
                  <span className="truncate">{summary.label}</span>
                </span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <time
              dateTime={c.lastMessageAt}
              title={formatAbsolute(c.lastMessageAt)}
              className="shrink-0"
            >
              {formatRelative(c.lastMessageAt, now)}
            </time>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {c.assigneeName ? (
            <span className="hidden text-xs text-neutral-500 dark:text-neutral-400 md:inline">
              {c.assigneeName}
            </span>
          ) : (
            <Badge variant="warning" size="sm">
              Unassigned
            </Badge>
          )}

          <SlaIndicator dueAt={c.slaDueAt} now={now} />

          <Badge variant={statusVariant[c.status]}>
            {statusLabel[c.status]}
          </Badge>
          <Badge variant={priorityVariant[c.priority]}>
            {priorityLabel[c.priority]}
          </Badge>
        </div>
      </button>
    </li>
  );
}

function toneFromDot(
  dotClass: string
): "success" | "warning" | "danger" | "info" | "neutral" {
  if (dotClass.includes("success")) return "success";
  if (dotClass.includes("warning")) return "warning";
  if (dotClass.includes("danger")) return "danger";
  if (dotClass.includes("info")) return "info";
  return "neutral";
}