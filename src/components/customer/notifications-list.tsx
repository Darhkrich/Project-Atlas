/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { mockNotifications, type MockNotification } from "@/lib/mock-data";

const filters = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "read", label: "Read" },
];

export function NotificationsList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");

  const loadData = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter((n) => !n.read);
    if (activeFilter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, activeFilter]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-12 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <AtlasSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <AtlasErrorState onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {unreadCount} unread notifications
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <AtlasIcon name="check" className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activeFilter === filter.id
                ? "bg-brand-800 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <AtlasCard padding="none">
        {filteredNotifications.length > 0 ? (
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredNotifications.map((notification) => (
              <li
                key={notification.id}
                className={`flex items-start gap-4 p-4 transition-colors ${
                  notification.read
                    ? ""
                    : "bg-brand-50/50 dark:bg-brand-900/20"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.iconBg}`}
                >
                  <AtlasIcon
                    name={notification.icon}
                    className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {notification.title}
                      {!notification.read && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-brand-700 dark:bg-brand-400" />
                      )}
                    </p>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {notification.time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {notification.description}
                  </p>
                  {notification.actionLabel && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mt-2 text-sm font-medium text-brand-800 hover:underline dark:text-brand-300"
                    >
                      {notification.actionLabel}
                    </button>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs font-medium text-neutral-500 hover:text-brand-800 dark:text-neutral-400 dark:hover:text-brand-300"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="rounded-md p-1.5 text-neutral-400 transition-colors hover:text-danger-600 dark:hover:text-danger-400"
                    aria-label="Delete notification"
                  >
                    <AtlasIcon name="x-circle" className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <AtlasEmptyState
            title="No notifications"
            description="You're all caught up."
          />
        )}
      </AtlasCard>
    </div>
  );
}