"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  NOTIFICATION_KIND_ICON,
  NOTIFICATION_KIND_LABEL,
} from "@/lib/merchant/notifications/labels";
import {
  projectRelativeTime,
  projectWakeTime,
  isSnoozed,
} from "@/lib/merchant/notifications/notifications-projection";
import {
  KIND_ICON_BOX_CLASS,
  KIND_RAIL_CLASS,
} from "@/lib/merchant/notifications/kind-meta";
import { SNOOZE_DURATIONS_MS } from "@/lib/merchant/notifications/types";
import type {
  MerchantNotification,
  MerchantNotificationLink,
} from "@/lib/merchant/notifications/types";

function hrefForLink(link: MerchantNotificationLink): string | null {
  switch (link.kind) {
    case "order":
      return "/merchant/orders/" + link.orderId;
    case "product":
      return "/merchant/products/" + link.productId;
    case "wallet":
      return "/merchant/wallet";
    case "billing":
      return "/merchant/billing";
    case "none":
    default:
      return null;
  }
}

interface NotificationRowProps {
  notification: MerchantNotification;
  now: number;
  focused: boolean;
  selectionMode: boolean;
  selected: boolean;
  onMarkRead: (id: string) => void;
  onSnooze: (id: string, untilMs: number) => void;
  onDismiss: (notification: MerchantNotification) => void;
  onToggleSelect: (id: string) => void;
  onFocusRow: (id: string) => void;
  onWakeNow: (id: string) => void;
}

export function NotificationRow({
  notification,
  now,
  focused,
  selectionMode,
  selected,
  onMarkRead,
  onSnooze,
  onDismiss,
  onToggleSelect,
  onFocusRow,
  onWakeNow,
}: NotificationRowProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!actionsOpen) return;
    const onDoc = (event: globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (actionsRef.current && !actionsRef.current.contains(target)) {
        setActionsOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActionsOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [actionsOpen]);

  const isUnread = notification.readAt === null;
  const snoozed = isSnoozed(notification, now);
  const href = hrefForLink(notification.link);
  const relative = projectRelativeTime(notification.createdAt, now);
  const absolute = new Date(notification.createdAt).toLocaleString();

  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const rowInner = (
    <div className="flex items-start gap-3 p-4">
      {selectionMode && (
        <span
          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center"
          onClick={stop}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(notification.id)}
            aria-label={"Select notification: " + notification.title}
            className="h-4 w-4 cursor-pointer rounded border-neutral-300 text-brand-600 focus:ring-2 focus:ring-brand-500 dark:border-neutral-600 dark:bg-neutral-800"
          />
        </span>
      )}

      <span
        aria-hidden="true"
        className={
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg " +
          KIND_ICON_BOX_CLASS[notification.kind]
        }
      >
        <AtlasIcon
          name={NOTIFICATION_KIND_ICON[notification.kind]}
          className="h-5 w-5"
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={
                "truncate text-sm " +
                (isUnread
                  ? "font-semibold text-neutral-900 dark:text-neutral-100"
                  : "font-medium text-neutral-700 dark:text-neutral-300")
              }
            >
              {notification.title}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {NOTIFICATION_KIND_LABEL[notification.kind]}
            </p>
          </div>
          {isUnread && (
            <span
              aria-hidden="true"
              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-600"
            />
          )}
        </div>

        <p className="mt-1.5 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
          {notification.body}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <time
            dateTime={new Date(notification.createdAt).toISOString()}
            title={absolute}
            className="text-neutral-500"
          >
            {relative}
          </time>

          {snoozed && notification.snoozedUntil !== null && (
            <>
              <span aria-hidden="true" className="text-neutral-300">
                {"\u2022"}
              </span>
              <span className="inline-flex items-center gap-1 text-warning-700 dark:text-warning-300">
                <AtlasIcon name="clock" className="h-3 w-3" />
                {projectWakeTime(notification.snoozedUntil, now)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  stop(e);
                  onWakeNow(notification.id);
                }}
                className="font-medium text-brand-700 hover:underline dark:text-brand-300"
              >
                Wake now
              </button>
            </>
          )}

          {!snoozed && (
            <>
              <span aria-hidden="true" className="text-neutral-300">
                {"\u2022"}
              </span>
              <div ref={actionsRef} className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    stop(e);
                    setActionsOpen((p) => !p);
                  }}
                  aria-label="Row actions"
                  aria-haspopup="menu"
                  aria-expanded={actionsOpen}
                  className="rounded p-1 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                >
                  <AtlasIcon name="more" className="h-4 w-4" />
                </button>
                {actionsOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    {isUnread && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={(e) => {
                          stop(e);
                          setActionsOpen(false);
                          onMarkRead(notification.id);
                        }}
                        className="block w-full px-3 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        stop(e);
                        setActionsOpen(false);
                        onSnooze(
                          notification.id,
                          Date.now() + SNOOZE_DURATIONS_MS.oneHour
                        );
                      }}
                      className="block w-full px-3 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      Snooze 1 hour
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        stop(e);
                        setActionsOpen(false);
                        onSnooze(
                          notification.id,
                          Date.now() + SNOOZE_DURATIONS_MS.fourHours
                        );
                      }}
                      className="block w-full px-3 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      Snooze 4 hours
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        stop(e);
                        setActionsOpen(false);
                        onSnooze(
                          notification.id,
                          Date.now() + SNOOZE_DURATIONS_MS.tomorrow
                        );
                      }}
                      className="block w-full px-3 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      Snooze until tomorrow
                    </button>
                    <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={(e) => {
                        stop(e);
                        setActionsOpen(false);
                        onDismiss(notification);
                      }}
                      className="block w-full px-3 py-1.5 text-left text-xs text-danger-600 hover:bg-neutral-50 dark:text-danger-400 dark:hover:bg-neutral-800"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              <div className="hidden items-center gap-3 sm:flex">
                {isUnread && (
                  <button
                    type="button"
                    onClick={(e) => {
                      stop(e);
                      onMarkRead(notification.id);
                    }}
                    className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    stop(e);
                    onSnooze(
                      notification.id,
                      Date.now() + SNOOZE_DURATIONS_MS.tomorrow
                    );
                  }}
                  className="font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Snooze
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    stop(e);
                    onDismiss(notification);
                  }}
                  className="font-medium text-neutral-500 hover:text-danger-600 dark:hover:text-danger-400"
                >
                  Dismiss
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {href && (
        <AtlasIcon
          name="chevron-right"
          className="mt-2 h-4 w-4 shrink-0 text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-neutral-600"
        />
      )}
    </div>
  );

  const wrapperClass =
    "group relative block border-l-2 transition-colors " +
    KIND_RAIL_CLASS[notification.kind] +
    " " +
    (focused
      ? "bg-brand-50/60 dark:bg-brand-900/15 "
      : isUnread
      ? "bg-brand-50/30 dark:bg-brand-900/10 "
      : "bg-white dark:bg-neutral-900 ") +
    (href ? "hover:bg-neutral-50 dark:hover:bg-neutral-800/60 " : "");

  const handleFocus = () => {
    onFocusRow(notification.id);
  };

  if (href) {
    return (
      <Link
        href={href}
        onFocus={handleFocus}
        onClick={() => {
          if (isUnread) onMarkRead(notification.id);
        }}
        className={wrapperClass}
      >
        {rowInner}
      </Link>
    );
  }

  return (
    <div
      tabIndex={0}
      onFocus={handleFocus}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFocusRow(notification.id);
        }
      }}
      className={wrapperClass}
    >
      {rowInner}
    </div>
  );
}