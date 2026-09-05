/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { mockNotifications, type MockNotification } from "@/lib/mock-data";

export function ResellerNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.read);
  }, [notifications, filter]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Communication</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
            Stay updated with wallet activity, order updates and Atlas announcements.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { id: "all", label: `All (${notifications.length})` },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "read", label: `Read (${notifications.length - unreadCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab.id
                ? "bg-brand-800 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <AtlasCard padding="none" className="overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filtered.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-4 px-5 py-4 ${
                  notification.read ? "" : "bg-brand-50/50 dark:bg-brand-900/10"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.iconBg}`}
                >
                  <AtlasIcon name={notification.icon} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {notification.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-neutral-500 dark:text-neutral-500">
                      {notification.time}
                    </span>
                    {notification.actionLabel && notification.actionHref && (
                      <a
                        href={notification.actionHref}
                        className="text-xs font-semibold text-brand-800 hover:underline dark:text-brand-300"
                      >
                        {notification.actionLabel}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <AtlasIcon name="bell" className="mx-auto h-8 w-8 text-neutral-400" />
            <p className="mt-2 text-sm text-neutral-500">No notifications yet.</p>
          </div>
        )}
      </AtlasCard>
    </div>
  );
}