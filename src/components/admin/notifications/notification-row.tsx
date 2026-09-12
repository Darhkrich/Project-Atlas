// components/admin/notifications/notification-row.tsx
"use client";

import { Badge } from "@/components/admin/ui/badge";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import {
  AUDIENCE_LABEL,
  CHANNEL_ICON,
  CHANNEL_LABEL,
  SECTION_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
  formatRecipientEstimate,
} from "@/lib/admin/notifications/constants";
import type { PlatformNotification } from "@/lib/admin/types/notification";

interface NotificationRowProps {
  notification: PlatformNotification;
  focused: boolean;
  now: number | null;
  onOpen: (id: string) => void;
  onFocus: (id: string) => void;
}

export function NotificationRow({
  notification,
  focused,
  now,
  onOpen,
  onFocus,
}: NotificationRowProps) {
  const n = notification;

  const timestampIso = n.sentAt ?? n.scheduledFor ?? n.createdAt;
  const timestampPrefix = n.sentAt ? "Sent" : n.scheduledFor ? "Scheduled" : "Created";

  const toneFromStatus =
    n.status === "sent"
      ? "success"
      : n.status === "scheduled"
      ? "warning"
      : n.status === "failed"
      ? "danger"
      : "neutral";

  return (
    <li
      data-notification-id={n.id}
      onMouseEnter={() => onFocus(n.id)}
      className={cn(
        "flex items-stretch gap-3 rounded-lg border bg-white px-3 py-3 transition-colors dark:bg-neutral-900",
        "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900/60",
        focused && "ring-1 ring-brand-300 dark:ring-brand-800"
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(n.id)}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <StatusDot tone={toneFromStatus} size="sm" />
            <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {n.title}
            </p>
            <Badge variant={STATUS_VARIANT[n.status]} size="sm">
              {STATUS_LABEL[n.status]}
            </Badge>
            {n.targetSection && n.targetSection !== "all" && (
              <Badge variant="brand" size="sm">
                {SECTION_LABEL[n.targetSection]}
              </Badge>
            )}
          </div>

          <p className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
            {n.message}
          </p>

          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{AUDIENCE_LABEL[n.audience]}</span>
            <span className="flex items-center gap-1">
              {n.channels.map((c) => (
                <span key={c} className="flex items-center gap-1" title={CHANNEL_LABEL[c]}>
                  <AtlasIcon name={CHANNEL_ICON[c]} className="h-3 w-3" />
                  <span className="hidden sm:inline">{CHANNEL_LABEL[c]}</span>
                </span>
              ))}
            </span>
            {typeof n.estimatedRecipients === "number" && (
              <span>{formatRecipientEstimate(n.estimatedRecipients)}</span>
            )}
            <time
              dateTime={timestampIso}
              title={formatAbsolute(timestampIso)}
            >
              {timestampPrefix} {formatRelative(timestampIso, now)}
            </time>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {n.deliveryStats && (
            <span className="hidden text-xs text-neutral-500 md:inline">
              {n.deliveryStats.delivered.toLocaleString("en-GH")} delivered
              {n.deliveryStats.failed > 0 && (
                <span className="ml-1 text-danger-600 dark:text-danger-400">
                  · {n.deliveryStats.failed.toLocaleString("en-GH")} failed
                </span>
              )}
            </span>
          )}
          <span className="text-neutral-400" aria-hidden="true">
            <AtlasIcon name="chevron-right" className="h-4 w-4" />
          </span>
        </div>
      </button>
    </li>
  );
}