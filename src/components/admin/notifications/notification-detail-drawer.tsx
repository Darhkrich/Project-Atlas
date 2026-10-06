/* eslint-disable @typescript-eslint/no-unused-vars */
// components/admin/notifications/notification-detail-drawer.tsx
"use client";

import { useId, useState } from "react";
import { PlatformNotification } from "@/lib/admin/types/notification";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/admin/hooks/use-now";
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

interface NotificationDetailDrawerProps {
  notification: PlatformNotification | null;
  onClose: () => void;
  onResend?: (id: string) => void;
  onRetryFailed?: (id: string) => void;
  onEdit?: (notification: PlatformNotification) => void;
  onDisable?: (id: string) => void;
}

export function NotificationDetailDrawer({
  notification,
  onClose,
  onResend,
  onRetryFailed,
  onEdit,
  onDisable,
}: NotificationDetailDrawerProps) {
  const isOpen = notification !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();
  const now = useNow();

  if (!notification) return null;

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <NotificationDetailBody
        key={notification.id}
        notification={notification}
        titleId={titleId}
        now={now}
        onClose={onClose}
        onResend={onResend}
        onRetryFailed={onRetryFailed}
        onEdit={onEdit}
        onDisable={onDisable}
      />
    </div>
  );
}

interface NotificationDetailBodyProps {
  notification: PlatformNotification;
  titleId: string;
  now: number | null;
  onClose: () => void;
  onResend?: (id: string) => void;
  onRetryFailed?: (id: string) => void;
  onEdit?: (notification: PlatformNotification) => void;
  onDisable?: (id: string) => void;
}

function NotificationDetailBody({
  notification,
  titleId,
  now,
  onClose,
  onResend,
  onRetryFailed,
  onEdit,
  onDisable,
}: NotificationDetailBodyProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const n = notification;
  const stats = n.deliveryStats;
  const canEdit = n.status === "draft" || n.status === "scheduled";
  const canCancel = n.status === "draft" || n.status === "scheduled";
  const canResend = n.status === "failed" || n.status === "sent";
  const canRetryFailed =
    n.status === "sent" && (stats?.failed ?? 0) > 0 && Boolean(onRetryFailed);

  const openRate =
    stats && stats.delivered > 0
      ? (stats.opened / stats.delivered) * 100
      : 0;
  const failureRate =
    stats && stats.totalRecipients > 0
      ? (stats.failed / stats.totalRecipients) * 100
      : 0;

  return (
    <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h2 id={titleId} className="text-lg font-semibold">
          Notification details
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {n.title}
            </p>
            <Badge variant={STATUS_VARIANT[n.status]}>
              {STATUS_LABEL[n.status]}
            </Badge>
            {n.targetSection && n.targetSection !== "all" && (
              <Badge variant="brand" size="sm">
                {SECTION_LABEL[n.targetSection]}
              </Badge>
            )}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700 dark:text-neutral-300">
            {n.message}
          </p>
        </div>

        <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="text-neutral-500 dark:text-neutral-400">Audience</dt>
          <dd className="text-neutral-900 dark:text-neutral-100">
            {AUDIENCE_LABEL[n.audience]}
          </dd>

          {typeof n.estimatedRecipients === "number" && (
            <>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Recipients
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                {formatRecipientEstimate(n.estimatedRecipients)}
              </dd>
            </>
          )}

          <dt className="text-neutral-500 dark:text-neutral-400">Channels</dt>
          <dd className="flex flex-wrap gap-1.5">
            {(n.sentChannels ?? n.channels).map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                <AtlasIcon
                  name={CHANNEL_ICON[c]}
                  aria-hidden="true"
                  className="h-3 w-3"
                />
                {CHANNEL_LABEL[c]}
              </span>
            ))}
          </dd>

          <dt className="text-neutral-500 dark:text-neutral-400">Created by</dt>
          <dd className="text-neutral-900 dark:text-neutral-100">
            {n.createdByName ?? n.createdBy}
          </dd>

          <dt className="text-neutral-500 dark:text-neutral-400">Created</dt>
          <dd>
            <time
              dateTime={n.createdAt}
              title={formatAbsolute(n.createdAt)}
              className="text-neutral-900 dark:text-neutral-100"
            >
              {formatRelative(n.createdAt, now)}
            </time>
          </dd>

          {n.scheduledFor && n.status !== "sent" && (
            <>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Scheduled
              </dt>
              <dd>
                <time
                  dateTime={n.scheduledFor}
                  title={formatAbsolute(n.scheduledFor)}
                  className="text-neutral-900 dark:text-neutral-100"
                >
                  {formatRelative(n.scheduledFor, now)}
                </time>
              </dd>
            </>
          )}

          {n.sentAt && (
            <>
              <dt className="text-neutral-500 dark:text-neutral-400">Sent</dt>
              <dd>
                <time
                  dateTime={n.sentAt}
                  title={formatAbsolute(n.sentAt)}
                  className="text-neutral-900 dark:text-neutral-100"
                >
                  {formatRelative(n.sentAt, now)}
                </time>
              </dd>
            </>
          )}

          {n.cancelledAt && (
            <>
              <dt className="text-neutral-500 dark:text-neutral-400">
                Cancelled
              </dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                <time
                  dateTime={n.cancelledAt}
                  title={formatAbsolute(n.cancelledAt)}
                >
                  {formatRelative(n.cancelledAt, now)}
                </time>
                {n.cancelledByName && (
                  <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">
                    by {n.cancelledByName}
                  </span>
                )}
              </dd>
            </>
          )}
        </dl>

        {n.status === "failed" && n.failureReason && (
          <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-xs dark:border-danger-800/60 dark:bg-danger-900/20">
            <p className="font-medium text-danger-800 dark:text-danger-200">
              Failed to send
            </p>
            <p className="mt-1 text-danger-700 dark:text-danger-300">
              {n.failureReason}
            </p>
          </div>
        )}

        {stats && (
          <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900/60">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Delivery stats
            </p>

            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                  Delivered
                </dt>
                <dd className="mt-0.5 font-semibold text-neutral-900 dark:text-neutral-100">
                  {stats.delivered.toLocaleString("en-GH")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                  Opened
                </dt>
                <dd className="mt-0.5 font-semibold text-neutral-900 dark:text-neutral-100">
                  {stats.opened.toLocaleString("en-GH")}
                  {stats.delivered > 0 && (
                    <span className="ml-1 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                      ({openRate.toFixed(1)}%)
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                  Failed
                </dt>
                <dd className="mt-0.5 font-semibold text-danger-600 dark:text-danger-400">
                  {stats.failed.toLocaleString("en-GH")}
                  {stats.totalRecipients > 0 && stats.failed > 0 && (
                    <span className="ml-1 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                      ({failureRate.toFixed(1)}%)
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                  Total recipients
                </dt>
                <dd className="mt-0.5 font-semibold text-neutral-900 dark:text-neutral-100">
                  {stats.totalRecipients.toLocaleString("en-GH")}
                </dd>
              </div>
            </dl>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>Open rate</span>
                <span>{openRate.toFixed(1)}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full bg-success-500"
                  style={{ width: `${Math.min(100, openRate)}%` }}
                />
              </div>
            </div>

            {n.failedRecipientBreakdown &&
              n.failedRecipientBreakdown.length > 0 && (
                <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-expanded={showBreakdown}
                    onClick={() => setShowBreakdown((v) => !v)}
                  >
                    {showBreakdown ? "Hide" : "Show"} failure reasons (
                    {n.failedRecipientBreakdown.length})
                  </Button>
                  {showBreakdown && (
                    <ul className="mt-2 space-y-1">
                      {n.failedRecipientBreakdown.map((b, i) => (
                        <li
                          key={i}
                          className="flex items-start justify-between gap-3 rounded bg-white p-2 text-xs dark:bg-neutral-900"
                        >
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {b.reason}
                          </span>
                          <span className="shrink-0 font-medium text-neutral-900 dark:text-neutral-100">
                            {b.count.toLocaleString("en-GH")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {canResend && onResend && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResend(n.id)}
            >
              {n.status === "failed" ? "Retry sending" : "Resend"}
            </Button>
          )}
          {canRetryFailed && onRetryFailed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRetryFailed(n.id)}
            >
              Retry failed only ({stats?.failed.toLocaleString("en-GH")})
            </Button>
          )}
          {canEdit && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(n)}
            >
              Edit
            </Button>
          )}
          {canCancel && onDisable && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDisable(n.id)}
            >
              Cancel notification
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}