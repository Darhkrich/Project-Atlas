/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
// app/(admin)/notifications/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { NotificationSummaryCards } from "@/components/admin/notifications/notification-summary-cards";
import { NotificationFilters, type NotificationFilterValues } from "@/components/admin/notifications/notification-filters";
import { NotificationRow } from "@/components/admin/notifications/notification-row";
import { NotificationCreateModal } from "@/components/admin/notifications/notification-create-modal";
import { NotificationDetailDrawer } from "@/components/admin/notifications/notification-detail-drawer";
import { mockNotifications } from "@/lib/admin/mock/notifications";
import {
  PlatformNotification,
  NotificationStatus,
} from "@/lib/admin/types/notification";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useNow } from "@/lib/admin/hooks/use-now";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import {
  ALL_CHANNELS,
  AUDIENCE_LABEL,
  CHANNEL_LABEL,
  formatRecipientEstimate,
} from "@/lib/admin/notifications/constants";
import { downloadCsv } from "@/lib/admin/support/csv-export";

const DEFAULT_FILTERS: NotificationFilterValues = {
  q: "",
  status: "",
  audience: "",
  channel: "",
  section: "",
};

const CURRENT_ADMIN = {
  id: "usr-001",
  name: "Yaw Mensah",
  email: "yaw.mensah@atlas.com",
};

type PendingAction =
  | { kind: "resend"; id: string }
  | { kind: "retry_failed"; id: string }
  | { kind: "cancel"; id: string }
  | null;

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationsPageInner />
    </Suspense>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-72 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="h-24 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function NotificationsPageInner() {
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<NotificationFilterValues & Record<string, string>>(
      DEFAULT_FILTERS as NotificationFilterValues & Record<string, string>
    );

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<PlatformNotification | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const now = useNow();

  useEffect(() => {
    const t = window.setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
    return () => window.clearTimeout(t);
  }, []);

  const selected = useMemo(
    () => notifications.find((n) => n.id === selectedId) ?? null,
    [notifications, selectedId]
  );

  const filtered = useMemo(() => {
    let list = notifications;

    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }
    if (filters.status) list = list.filter((n) => n.status === filters.status);
    if (filters.audience)
      list = list.filter((n) => n.audience === filters.audience);
    if (filters.channel)
      list = list.filter((n) => n.channels.includes(filters.channel as never));
    if (filters.section)
      list = list.filter((n) => n.targetSection === filters.section);

    return list;
  }, [notifications, filters]);

  const filteredIds = useMemo(() => filtered.map((n) => n.id), [filtered]);

  useEffect(() => {
    if (focusedId && !filteredIds.includes(focusedId)) {
      setFocusedId(filteredIds[0] ?? null);
    }
  }, [filteredIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = document.querySelector(`[data-notification-id="${focusedId}"]`);
    if (el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: filteredIds,
    focusedId,
    enabled:
      selectedId === null &&
      !showCreate &&
      editing === null &&
      pendingAction === null,
    onFocusChange: setFocusedId,
    onOpen: setSelectedId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const summaryData = useMemo(
    () => ({
      totalSent: notifications.filter((n) => n.status === "sent").length,
      scheduled: notifications.filter((n) => n.status === "scheduled").length,
      failed: notifications.filter((n) => n.status === "failed").length,
      draft: notifications.filter((n) => n.status === "draft").length,
    }),
    [notifications]
  );

  const handleCreate = (n: PlatformNotification) => {
    setNotifications((prev) => [n, ...prev]);
  };

  const handleUpdate = (updated: PlatformNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n))
    );
  };

  const handleSendTest = (n: PlatformNotification) => {
    // In a real backend this would dispatch a test send.
    // For now, add to the list so the operator can verify shape.
    setNotifications((prev) => [n, ...prev]);
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const { kind, id } = pendingAction;

    if (kind === "resend") {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                status: "sent",
                sentAt: new Date().toISOString(),
                failureReason: undefined,
                failedRecipientBreakdown: undefined,
                sentChannels: n.channels,
              }
            : n
        )
      );
    }

    if (kind === "retry_failed") {
      setNotifications((prev) =>
        prev.map((n) => {
          if (n.id !== id || !n.deliveryStats) return n;
          const recovered = n.deliveryStats.failed;
          return {
            ...n,
            deliveryStats: {
              ...n.deliveryStats,
              delivered: n.deliveryStats.delivered + recovered,
              failed: 0,
            },
            failedRecipientBreakdown: undefined,
          };
        })
      );
    }

    if (kind === "cancel") {
      const nowIso = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                status: "cancelled",
                cancelledAt: nowIso,
                cancelledById: CURRENT_ADMIN.id,
                cancelledByName: CURRENT_ADMIN.name,
              }
            : n
        )
      );
    }

    setPendingAction(null);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const header = [
      "id",
      "title",
      "status",
      "audience",
      "section",
      "channels",
      "estimatedRecipients",
      "delivered",
      "opened",
      "failed",
      "createdAt",
      "sentAt",
    ];
    const rows = filtered.map((n) => [
      n.id,
      n.title,
      n.status,
      n.audience,
      n.targetSection ?? "",
      n.channels.join("|"),
      n.estimatedRecipients ?? "",
      n.deliveryStats?.delivered ?? "",
      n.deliveryStats?.opened ?? "",
      n.deliveryStats?.failed ?? "",
      n.createdAt,
      n.sentAt ?? "",
    ]);
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [header, ...rows]
      .map((r) => r.map(escape).join(","))
      .join("\r\n");
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`atlas-notifications-${stamp}.csv`, csv);
  };

  const pendingNotification = pendingAction
    ? notifications.find((n) => n.id === pendingAction.id)
    : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Create and send platform-wide notifications."
        meta={
          <>
            <span>{notifications.length} total</span>
            <span aria-hidden="true">·</span>
            <span>{summaryData.scheduled} scheduled</span>
            {summaryData.failed > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-danger-700 dark:text-danger-300">
                  {summaryData.failed} failed
                </span>
              </>
            )}
          </>
        }
        actions={
          <>
            <ExportMenu onExport={handleExport} formats={["csv"]} />
            <Button size="sm" onClick={() => setShowCreate(true)}>
              Create notification
            </Button>
          </>
        }
      />

      <NotificationSummaryCards
        data={summaryData}
        activeStatus={filters.status}
        onSelect={(status) =>
          setFilters({ status, q: filters.q, audience: filters.audience, channel: filters.channel, section: filters.section })
        }
      />

      <NotificationFilters
        values={filters}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
      />

      <p className="text-xs text-neutral-500 dark:text-neutral-400" aria-live="polite">
        {filtered.length} of {notifications.length} notification
        {notifications.length === 1 ? "" : "s"}
      </p>

      {loading ? (
        <div
          className="space-y-2"
          aria-busy="true"
          aria-label="Loading notifications"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {hasActive ? (
            <EmptyState
              variant="no_results"
              title="No notifications match these filters"
              description="Try a different search or clear the filters to see all notifications."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="no_data"
              title="No notifications yet"
              description="Create your first platform-wide notification to get started."
              action={
                <Button size="sm" onClick={() => setShowCreate(true)}>
                  Create notification
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <ul role="list" className="space-y-2">
          {filtered.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              focused={focusedId === n.id}
              now={now}
              onOpen={setSelectedId}
              onFocus={setFocusedId}
            />
          ))}
        </ul>
      )}

      {showCreate && (
        <NotificationCreateModal
          currentAdmin={CURRENT_ADMIN}
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
          onSendTest={handleSendTest}
        />
      )}

      {editing && (
        <NotificationCreateModal
          currentAdmin={CURRENT_ADMIN}
          initialNotification={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}

      <NotificationDetailDrawer
        notification={selected}
        onClose={() => setSelectedId(null)}
        onResend={(id) => {
          setPendingAction({ kind: "resend", id });
          setSelectedId(null);
        }}
        onRetryFailed={(id) => {
          setPendingAction({ kind: "retry_failed", id });
          setSelectedId(null);
        }}
        onEdit={(n) => {
          setEditing(n);
          setSelectedId(null);
        }}
        onDisable={(id) => {
          setPendingAction({ kind: "cancel", id });
          setSelectedId(null);
        }}
      />

      <ConfirmDialog
        open={pendingAction?.kind === "resend"}
        title="Resend notification?"
        description={
          pendingNotification
            ? `${pendingNotification.title} will be sent again to ${formatRecipientEstimate(
                pendingNotification.estimatedRecipients ??
                  pendingNotification.deliveryStats?.totalRecipients ??
                  0
              )} across ${pendingNotification.channels.length} channel${
                pendingNotification.channels.length === 1 ? "" : "s"
              } (${pendingNotification.channels.map((c) => CHANNEL_LABEL[c]).join(", ")}). This cannot be undone.`
            : ""
        }
        confirmLabel="Resend"
        danger
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />

      <ConfirmDialog
        open={pendingAction?.kind === "retry_failed"}
        title="Retry failed recipients?"
        description={
          pendingNotification?.deliveryStats
            ? `Retry sending to the ${pendingNotification.deliveryStats.failed.toLocaleString(
                "en-GH"
              )} recipients that failed. The rest of the notification stays unchanged.`
            : ""
        }
        confirmLabel="Retry"
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />

      <ConfirmDialog
        open={pendingAction?.kind === "cancel"}
        title="Cancel notification?"
        description={
          pendingNotification
            ? `${pendingNotification.title} will be cancelled. ${
                pendingNotification.estimatedRecipients
                  ? `It was scheduled for ${formatRecipientEstimate(
                      pendingNotification.estimatedRecipients
                    )} across ${pendingNotification.channels.length} channel${
                      pendingNotification.channels.length === 1 ? "" : "s"
                    }. `
                  : ""
              }This can be undone by editing the notification and rescheduling.`
            : ""
        }
        confirmLabel="Cancel notification"
        cancelLabel="Keep scheduled"
        danger
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}