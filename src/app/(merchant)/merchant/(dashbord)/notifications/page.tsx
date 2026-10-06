/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMerchantNotifications } from "@/lib/merchant/notifications/use-merchant-notifications";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import {
  markNotificationRead,
  markAllNotificationsRead,
  snoozeNotification,
  unsnoozeNotification,
  dismissNotification,
  restoreNotification,
} from "@/lib/merchant/notifications/notifications-mutations";
import {
  markNotificationsRead,
  snoozeNotifications,
  dismissNotifications,
  dismissAllRead,
} from "@/lib/merchant/notifications/notifications-bulk-mutations";
import { projectKindCounts } from "@/lib/merchant/notifications/notifications-projection";
import { NOTIFICATION_PAGE_SIZE } from "@/lib/merchant/notifications/constants";
import { SNOOZE_DURATIONS_MS } from "@/lib/merchant/notifications/types";
import type {
  MerchantNotification,
  MerchantNotificationKind,
} from "@/lib/merchant/notifications/types";
import {
  useNotificationFilters,
} from "@/lib/merchant/notifications/use-notification-filters";
import { useNotificationSelection } from "@/lib/merchant/notifications/use-notification-selection";
import { useNotificationKeyboard } from "@/lib/merchant/notifications/use-notification-keyboard";
import { NotificationSummaryStrip } from "@/components/merchant/notifications/notification-summary-strip";
import { NotificationTabs } from "@/components/merchant/notifications/notification-tabs";
import { NotificationSearch } from "@/components/merchant/notifications/notification-search";
import { NotificationPageMenu } from "@/components/merchant/notifications/notification-page-menu";
import { NotificationList } from "@/components/merchant/notifications/notification-list";
import { NotificationBulkBar } from "@/components/merchant/notifications/notification-bulk-bar";
import { NotificationEmptyState } from "@/components/merchant/notifications/notification-empty-state";
import { NotificationUndoToast } from "@/components/merchant/notifications/notification-undo-toast";
import { buildCsv, downloadCsv } from "@/lib/merchant/support/csv";
import { NOTIFICATION_KIND_LABEL } from "@/lib/merchant/notifications/labels";

function isoOrEmpty(value: unknown): string {
  if (typeof value !== "number") return "";
  if (!Number.isFinite(value)) return "";
  return new Date(value).toISOString();
}

export default function MerchantNotificationsPage() {
  const router = useRouter();
  const merchant = useCurrentMerchant();

  const {
    notifications,
    visibleNotifications,
    snoozedNotifications,
    unreadCount,
    snoozedCount,
    now,
  } = useMerchantNotifications();

  const {
    filter,
    kindFilter,
    setFilter,
    setKindFilter,
  } = useNotificationFilters();

  const selection = useNotificationSelection();

  const [search, setSearch] = useState("");
  const [pageCount, setPageCount] = useState(NOTIFICATION_PAGE_SIZE);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pendingUndo, setPendingUndo] = useState<MerchantNotification | null>(
    null
  );
  const undoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setPageCount(NOTIFICATION_PAGE_SIZE);
  }, [filter, kindFilter, search]);

  useEffect(() => {
    if (!pendingUndo) return;
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    undoTimerRef.current = window.setTimeout(() => {
      setPendingUndo(null);
      undoTimerRef.current = null;
    }, 5000);
    return () => {
      if (undoTimerRef.current) {
        window.clearTimeout(undoTimerRef.current);
        undoTimerRef.current = null;
      }
    };
  }, [pendingUndo]);

  const baseList = useMemo(() => {
    if (filter === "snoozed") return snoozedNotifications;
    return visibleNotifications;
  }, [filter, visibleNotifications, snoozedNotifications]);

  const filtered = useMemo(() => {
    let list = baseList;
    if (filter === "unread") list = list.filter((n) => n.readAt === null);
    if (filter === "read") list = list.filter((n) => n.readAt !== null);
    if (kindFilter !== "all") list = list.filter((n) => n.kind === kindFilter);
    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(needle) ||
          n.body.toLowerCase().includes(needle)
      );
    }
    return list;
  }, [baseList, filter, kindFilter, search]);

  const counts = useMemo(
    () => ({
      all: visibleNotifications.length,
      unread: visibleNotifications.filter((n) => n.readAt === null).length,
      read: visibleNotifications.filter((n) => n.readAt !== null).length,
      snoozed: snoozedNotifications.length,
    }),
    [visibleNotifications, snoozedNotifications]
  );

  const kindCounts = useMemo(
    () => projectKindCounts(notifications, now),
    [notifications, now]
  );

  const awaitingAction = useMemo(() => {
    const actionKinds: MerchantNotificationKind[] = [
      "order_received",
      "product_low_stock",
      "plan_renewal_reminder",
      "wallet_withdrawal_rejected",
    ];
    return visibleNotifications.filter(
      (n) => n.readAt === null && actionKinds.includes(n.kind)
    ).length;
  }, [visibleNotifications]);

  const visibleSlice = filtered.slice(0, pageCount);
  const remaining = Math.max(0, filtered.length - pageCount);

  const handleMarkRead = useCallback(
    (id: string) => {
      if (!merchant) return;
      markNotificationRead(merchant.id, id);
    },
    [merchant]
  );

  const handleSnooze = useCallback(
    (id: string, untilMs: number) => {
      if (!merchant) return;
      snoozeNotification(merchant.id, id, untilMs);
    },
    [merchant]
  );

  const handleWakeNow = useCallback(
    (id: string) => {
      if (!merchant) return;
      unsnoozeNotification(merchant.id, id);
    },
    [merchant]
  );

  const handleDismiss = useCallback(
    (notification: MerchantNotification) => {
      if (!merchant) return;
      dismissNotification(merchant.id, notification.id);
      setPendingUndo(notification);
    },
    [merchant]
  );

  const handleUndo = useCallback(() => {
    if (!merchant || !pendingUndo) return;
    restoreNotification(merchant.id, pendingUndo);
    setPendingUndo(null);
  }, [merchant, pendingUndo]);

  const handleMarkAllRead = useCallback(() => {
    if (!merchant) return;
    markAllNotificationsRead(merchant.id);
  }, [merchant]);

  const handleDismissAllRead = useCallback(() => {
    if (!merchant) return;
    dismissAllRead(merchant.id);
  }, [merchant]);

  const handleExportCsv = useCallback(() => {
    if (filtered.length === 0) return;
    const headers = [
      "Created at",
      "Kind",
      "Title",
      "Body",
      "Read",
      "Snoozed until",
    ];
    const rows = filtered.map((n) => [
      isoOrEmpty(n.createdAt),
      NOTIFICATION_KIND_LABEL[n.kind],
      n.title,
      n.body,
      n.readAt !== null ? "yes" : "no",
      isoOrEmpty(n.snoozedUntil),
    ]);
    downloadCsv("atlas-notifications.csv", buildCsv(headers, rows));
  }, [filtered]);

  const handleBulkMarkRead = useCallback(() => {
    if (!merchant) return;
    markNotificationsRead(merchant.id, Array.from(selection.selectedIds));
    selection.clear();
  }, [merchant, selection]);

  const handleBulkSnooze = useCallback(() => {
    if (!merchant) return;
    snoozeNotifications(
      merchant.id,
      Array.from(selection.selectedIds),
      Date.now() + SNOOZE_DURATIONS_MS.tomorrow
    );
    selection.clear();
  }, [merchant, selection]);

  const handleBulkDismiss = useCallback(() => {
    if (!merchant) return;
    dismissNotifications(merchant.id, Array.from(selection.selectedIds));
    selection.clear();
  }, [merchant, selection]);

  const currentIndex = useMemo(() => {
    if (!focusedId) return -1;
    return visibleSlice.findIndex((n) => n.id === focusedId);
  }, [focusedId, visibleSlice]);

  const moveDown = useCallback(() => {
    if (visibleSlice.length === 0) return;
    const next =
      currentIndex < 0
        ? 0
        : Math.min(currentIndex + 1, visibleSlice.length - 1);
    setFocusedId(visibleSlice[next].id);
  }, [currentIndex, visibleSlice]);

  const moveUp = useCallback(() => {
    if (visibleSlice.length === 0) return;
    const next = currentIndex <= 0 ? 0 : currentIndex - 1;
    setFocusedId(visibleSlice[next].id);
  }, [currentIndex, visibleSlice]);

  const currentNotification = useMemo(
    () =>
      focusedId
        ? visibleSlice.find((n) => n.id === focusedId) ?? null
        : null,
    [focusedId, visibleSlice]
  );

  useNotificationKeyboard(true, {
    onMoveDown: moveDown,
    onMoveUp: moveUp,
    onOpen: () => {
      if (!currentNotification) return;
      const link = currentNotification.link;
      if (link.kind === "order")
        router.push("/merchant/orders/" + link.orderId);
      else if (link.kind === "product")
        router.push("/merchant/products/" + link.productId);
      else if (link.kind === "wallet") router.push("/merchant/wallet");
      else if (link.kind === "billing") router.push("/merchant/billing");
    },
    onMarkRead: () => {
      if (currentNotification) handleMarkRead(currentNotification.id);
    },
    onSnooze: () => {
      if (currentNotification)
        handleSnooze(
          currentNotification.id,
          Date.now() + SNOOZE_DURATIONS_MS.tomorrow
        );
    },
    onDismiss: () => {
      if (currentNotification) handleDismiss(currentNotification);
    },
    onMarkAllRead: handleMarkAllRead,
    onEscape: () => {
      if (selection.selectionMode) selection.exitSelection();
      else setFocusedId(null);
    },
    onToggleSelect: () => {
      if (currentNotification) {
        if (!selection.selectionMode) {
          selection.enterSelection(currentNotification.id);
        } else {
          selection.toggle(currentNotification.id);
        }
      }
    },
  });

  const handleEmptyCta = () => {
    if (filter === "unread") setFilter("all");
    else if (filter === "read") setFilter("unread");
    else if (filter === "snoozed") setFilter("all");
    else router.push("/merchant/dashboard");
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {unreadCount === 0
              ? "Nothing needs your attention."
              : unreadCount === 1
              ? "1 item since your last visit."
              : unreadCount + " items since your last visit."}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!selection.selectionMode ? (
            <button
              type="button"
              onClick={() => selection.enterSelection()}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Select
            </button>
          ) : (
            <button
              type="button"
              onClick={selection.exitSelection}
              className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-200"
            >
              Done selecting
            </button>
          )}
          <NotificationPageMenu
            canMarkAllRead={unreadCount > 0}
            canDismissAllRead={counts.read > 0}
            canExport={filtered.length > 0}
            onMarkAllRead={handleMarkAllRead}
            onDismissAllRead={handleDismissAllRead}
            onExportCsv={handleExportCsv}
          />
        </div>
      </div>

      <NotificationSummaryStrip
        unread={unreadCount}
        awaitingAction={awaitingAction}
        snoozed={snoozedCount}
      />

      <NotificationSearch value={search} onChange={setSearch} />

      <NotificationTabs
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        kindFilter={kindFilter}
        onKindChange={setKindFilter}
        kindCounts={kindCounts}
      />

      {visibleSlice.length === 0 ? (
        <NotificationEmptyState filter={filter} onCta={handleEmptyCta} />
      ) : (
        <>
          <NotificationList
            notifications={visibleSlice}
            now={now}
            focusedId={focusedId}
            selectionMode={selection.selectionMode}
            selectedIds={selection.selectedIds}
            onMarkRead={handleMarkRead}
            onSnooze={handleSnooze}
            onDismiss={handleDismiss}
            onToggleSelect={selection.toggle}
            onFocusRow={setFocusedId}
            onWakeNow={handleWakeNow}
          />
          {remaining > 0 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() =>
                  setPageCount((prev) => prev + NOTIFICATION_PAGE_SIZE)
                }
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Load more ({remaining} remaining)
              </button>
            </div>
          )}
        </>
      )}

      <NotificationBulkBar
        count={selection.selectedCount}
        onMarkRead={handleBulkMarkRead}
        onSnooze={handleBulkSnooze}
        onDismiss={handleBulkDismiss}
        onClear={selection.clear}
      />

      <NotificationUndoToast
        visible={pendingUndo !== null}
        onUndo={handleUndo}
      />
    </div>
  );
}