 "use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NotificationSummaryCards } from "@/components/admin/notifications/notification-summary-cards";
import { NotificationCreateModal } from "@/components/admin/notifications/notification-create-modal";
import { NotificationDetailDrawer } from "@/components/admin/notifications/notification-detail-drawer";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { mockNotifications } from "@/lib/admin/mock/notifications";
import { PlatformNotification } from "@/lib/admin/types/notification";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

const statusVariantMap = {
  draft: "neutral",
  scheduled: "warning",
  sent: "success",
  failed: "danger",
  cancelled: "neutral",
} as const;

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()} ${d.getUTCHours()}:${d.getUTCMinutes()}`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<PlatformNotification | null>(null);
  const [editing, setEditing] = useState<PlatformNotification | null>(null);
  const [disableConfirm, setDisableConfirm] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = notifications.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && n.status !== statusFilter) return false;
    return true;
  });

  const summaryData = {
    totalSent: notifications.filter(n => n.status === "sent").length,
    scheduled: notifications.filter(n => n.status === "scheduled").length,
    failed: notifications.filter(n => n.status === "failed").length,
    draft: notifications.filter(n => n.status === "draft").length,
  };

  const handleCreateNotification = (notification: PlatformNotification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const handleUpdateNotification = (updated: PlatformNotification) => {
    setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
    setSelected(prev => prev && prev.id === updated.id ? updated : prev);
  };

  const handleResend = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "sent", sentAt: new Date().toISOString() } : n));
    setSelected(prev => prev && prev.id === id ? { ...prev, status: "sent", sentAt: new Date().toISOString() } : prev);
  };

  const handleDisable = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "cancelled" as unknown as PlatformNotification["status"] } : n));
    setSelected(prev => prev && prev.id === id ? { ...prev, status: "cancelled" as unknown as PlatformNotification["status"] } : prev);
    setDisableConfirm(null);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export notifications as ${format}`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Create and send platform-wide notifications."
        actions={
          <>
            <ExportMenu onExport={handleExport} />
            <Button size="sm" onClick={() => setShowCreate(true)}>Create Notification</Button>
          </>
        }
      />

      <NotificationSummaryCards data={summaryData} />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search notifications..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card><CardContent>No notifications found.</CardContent></Card>
          ) : (
            filtered.map(n => (
              <Card key={n.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{n.title}</p>
                        <Badge variant={statusVariantMap[n.status]}>{n.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-neutral-500">{n.message}</p>
                      <p className="mt-2 text-xs text-neutral-400">
                        Audience: {n.audience} · Channels: {n.channels.join(", ")}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {n.sentAt ? `Sent: ${formatTimestamp(n.sentAt)}` : n.scheduledFor ? `Scheduled: ${formatTimestamp(n.scheduledFor)}` : "Not sent"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelected(n)}>View</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <NotificationCreateModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreateNotification}
        />
      )}

      {/* Edit Modal */}
      {editing && (
        <NotificationCreateModal
          initialNotification={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdateNotification}
        />
      )}

      {/* Detail Drawer */}
      <NotificationDetailDrawer
        notification={selected}
        onClose={() => setSelected(null)}
        onResend={handleResend}
        onEdit={(n) => {
          setEditing(n);
          setSelected(null);
        }}
        onDisable={(id) => setDisableConfirm(id)}
      />

      {/* Disable Confirmation */}
      <ConfirmDialog
        open={disableConfirm !== null}
        title="Disable Notification"
        description="Are you sure you want to disable this notification? It will be marked as cancelled."
        confirmLabel="Disable"
        danger
        onConfirm={() => disableConfirm && handleDisable(disableConfirm)}
        onCancel={() => setDisableConfirm(null)}
      />
    </div>
  );
}