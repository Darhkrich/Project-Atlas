"use client";

import { PlatformNotification } from "@/lib/admin/types/notification";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";

interface NotificationDetailDrawerProps {
  notification: PlatformNotification | null;
  onClose: () => void;
  onResend?: (id: string) => void;
  onEdit?: (notification: PlatformNotification) => void;
  onDisable?: (id: string) => void;
}

const statusVariantMap = {
  draft: "neutral",
  scheduled: "warning",
  sent: "success",
  failed: "danger",
  cancelled: "neutral",
} as const;

export function NotificationDetailDrawer({
  notification,
  onClose,
  onResend,
  onEdit,
  onDisable,
}: NotificationDetailDrawerProps) {
  if (!notification) return null;

  const stats = notification.deliveryStats;
  const canEdit = notification.status === "draft" || notification.status === "scheduled";
  const canDisable = notification.status === "draft" || notification.status === "scheduled";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Notification Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-lg">{notification.title}</p>
            <Badge variant={statusVariantMap[notification.status]}>{notification.status}</Badge>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{notification.message}</p>
          <div>
            <p className="text-sm text-neutral-500">Audience: {notification.audience}</p>
            <p className="text-sm text-neutral-500">Channels: {notification.channels.join(", ")}</p>
          </div>
          <div className="text-sm text-neutral-500">
            <p>Created by: {notification.createdBy}</p>
            <p>Created at: {new Date(notification.createdAt).toLocaleString()}</p>
            {notification.scheduledFor && <p>Scheduled for: {new Date(notification.scheduledFor).toLocaleString()}</p>}
            {notification.sentAt && <p>Sent at: {new Date(notification.sentAt).toLocaleString()}</p>}
          </div>

          {/* Delivery Stats */}
          {stats && (
            <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
              <p className="text-sm font-medium mb-2">Delivery Stats</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-neutral-500">Delivered</p>
                  <p className="font-semibold">{stats.delivered}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Opened</p>
                  <p className="font-semibold">{stats.opened}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Failed</p>
                  <p className="font-semibold text-danger-600">{stats.failed}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Total Recipients</p>
                  <p className="font-semibold">{stats.totalRecipients}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-neutral-500">Open Rate</p>
                <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className="h-2 rounded-full bg-success-500"
                    style={{ width: `${(stats.opened / Math.max(stats.delivered, 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {notification.status === "failed" && onResend && (
              <Button variant="outline" size="sm" onClick={() => onResend(notification.id)}>Retry Sending</Button>
            )}
            {canEdit && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(notification)}>Edit</Button>
            )}
            {canDisable && onDisable && (
              <Button variant="destructive" size="sm" onClick={() => onDisable(notification.id)}>Disable</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}