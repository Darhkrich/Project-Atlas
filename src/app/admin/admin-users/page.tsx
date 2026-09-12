/* eslint-disable react-hooks/set-state-in-effect */
// app/(admin)/accounts/admin-users/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AdminUserSummaryCards } from "@/components/admin/admin-users/admin-user-summary-cards";
import {
  AdminUserFilters,
  type AdminUserFilterValues,
} from "@/components/admin/admin-users/admin-user-filters";
import { AdminUserCard } from "@/components/admin/admin-users/admin-user-card";
import { AdminUserDetailDrawer } from "@/components/admin/admin-users/admin-user-detail-drawer";
import { AdminUserToolbar } from "@/components/admin/admin-users/admin-user-toolbar";
import { AdminUserInviteModal } from "@/components/admin/admin-users/admin-user-invite-modal";
import {
  mockAdminUsers,
  mockAdminQueues,
} from "@/lib/admin/mock/admin-users";
import { mockTwoFactorStatuses } from "@/lib/admin/mock/security";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useInboxKeyboard } from "@/lib/admin/hooks/use-inbox-keyboard";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { adminUsersToCsv } from "@/lib/admin/admin-users/csv-export";
import { PAGE_SIZE } from "@/lib/admin/admin-users/constants";
import { roleLabel, type Permission, type Role } from "@/lib/admin/rbac";
import type { AdminUser } from "@/lib/admin/types/admin-user";
import type { SupportUserType } from "@/lib/admin/types/support";

const CURRENT_ADMIN_ID = "usr-001";

const DEFAULT_FILTERS: AdminUserFilterValues = {
  q: "",
  role: "",
  status: "",
  sort: "name",
  page: "1",
};

type BulkIntent =
  | { kind: "suspend"; ids: string[] }
  | { kind: "reactivate"; ids: string[] }
  | { kind: "change_role"; ids: string[]; role: Role };

interface Toast {
  kind: "success" | "error";
  text: string;
  onUndo?: () => void;
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<AdminUsersSkeleton />}>
      <AdminUsersPageInner />
    </Suspense>
  );
}

function AdminUsersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-52 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function AdminUsersPageInner() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [bulkIntent, setBulkIntent] = useState<BulkIntent | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<AdminUserFilterValues>(DEFAULT_FILTERS);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setUsers(mockAdminUsers);
      setLoading(false);
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const queueNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const q of mockAdminQueues) map.set(q.id, q.name);
    return map;
  }, []);

  const twoFactorByAdminId = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const entry of mockTwoFactorStatuses) {
      map.set(entry.adminId, entry.enabled);
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    let list = users;

    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    if (filters.role) list = list.filter((u) => u.role === filters.role);
    if (filters.status) list = list.filter((u) => u.status === filters.status);

    const sorted = [...list];
    const sortKey = filters.sort;
    sorted.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "role") return a.role.localeCompare(b.role);
      if (sortKey === "status") return a.status.localeCompare(b.status);
      if (sortKey === "createdAt")
        return b.createdAt.localeCompare(a.createdAt);
      if (sortKey === "lastLogin") {
        const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
        const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
        return bTime - aTime;
      }
      return 0;
    });

    return sorted;
  }, [users, filters.q, filters.role, filters.status, filters.sort]);

  const page = Math.max(1, Number(filters.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const filteredIds = useMemo(() => paginated.map((u) => u.id), [paginated]);

  useEffect(() => {
    if (focusedId && !filteredIds.includes(focusedId)) {
      setFocusedId(filteredIds[0] ?? null);
    }
  }, [filteredIds, focusedId]);

  useEffect(() => {
    if (!focusedId) return;
    const el = document.querySelector(`[data-admin-user-id="${focusedId}"]`);
    if (el instanceof HTMLElement) el.scrollIntoView({ block: "nearest" });
  }, [focusedId]);

  useInboxKeyboard({
    itemIds: filteredIds,
    focusedId,
    enabled: selectedId === null && !inviteOpen && bulkIntent === null,
    onFocusChange: setFocusedId,
    onOpen: setSelectedId,
    onFocusSearch: () => searchInputRef.current?.focus(),
  });

  const selected = useMemo(
    () => users.find((u) => u.id === selectedId) ?? null,
    [users, selectedId]
  );

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleChangeRole = (id: string, role: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    setToast({
      kind: "success",
      text: `Role updated to ${roleLabel(role)}.`,
    });
  };

  const handleUpdatePermissions = (
    id: string,
    extraPermissions: Permission[]
  ) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, extraPermissions } : u))
    );
    setToast({
      kind: "success",
      text: `Extra permissions updated (${extraPermissions.length} granted).`,
    });
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === "active" ? "suspended" : "active",
            }
          : u
      )
    );
    setToast({ kind: "success", text: "Status updated." });
  };

  const handleResetPassword = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    setToast({
      kind: "success",
      text: `Password reset link sent to ${target.email}.`,
    });
  };

  const handleResendInvite = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    setToast({
      kind: "success",
      text: `Invitation resent to ${target.email}.`,
    });
  };

  const handleDelete = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setSelectedId(null);
    setToast({
      kind: "success",
      text: `Deleted ${target.name}.`,
      onUndo: () => {
        setUsers((prev) => [target, ...prev]);
      },
    });
  };

  const handleUndo = () => {
    if (toast?.onUndo) {
      toast.onUndo();
      setToast({ kind: "success", text: "Restored." });
    }
  };

  const handleSendNotification = (
    id: string,
    channel: "email" | "sms" | "push",
    message: string
  ) => {
    void message;
    const target = users.find((u) => u.id === id);
    if (!target) return;
    setToast({
      kind: "success",
      text: `${channel.toUpperCase()} sent to ${target.name}.`,
    });
  };

  const handleInvite = (invite: {
    name: string;
    email: string;
    role: Role;
    queueIds: string[];
    handles: SupportUserType[];
    message?: string;
  }) => {
    const nowIso = new Date().toISOString();
    const newUser: AdminUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      name: invite.name,
      email: invite.email,
      role: invite.role,
      extraPermissions: [],
      status: "pending",
      queueIds: invite.queueIds,
      handles: invite.handles,
      emailVerified: false,
      invitedAt: nowIso,
      invitedBy: CURRENT_ADMIN_ID,
      createdAt: nowIso,
      lastLogin: null,
      activityLog: [],
    };
    setUsers((prev) => [newUser, ...prev]);
    setToast({
      kind: "success",
      text: `Invitation sent to ${invite.email}.`,
    });
  };

  const bulkSelectedUsers = useMemo(
    () => users.filter((u) => selectedIds.includes(u.id)),
    [users, selectedIds]
  );

  const handleBulkSuspend = () => {
    setBulkIntent({ kind: "suspend", ids: selectedIds });
  };

  const handleBulkReactivate = () => {
    setBulkIntent({ kind: "reactivate", ids: selectedIds });
  };

  const handleBulkChangeRole = (role: Role) => {
    setBulkIntent({ kind: "change_role", ids: selectedIds, role });
  };

  const handleBulkSendNotification = () => {
    setToast({
      kind: "success",
      text: `Notification queued for ${selectedIds.length} admin${
        selectedIds.length === 1 ? "" : "s"
      }.`,
    });
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const csv = adminUsersToCsv(bulkSelectedUsers);
    downloadCsv(
      `atlas-admin-users-selected-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
    setToast({
      kind: "success",
      text: `Exported ${bulkSelectedUsers.length} admins.`,
    });
    setSelectedIds([]);
  };

  const confirmBulk = () => {
    if (!bulkIntent) return;
    const idSet = new Set(bulkIntent.ids);
    if (bulkIntent.kind === "suspend") {
      setUsers((prev) =>
        prev.map((u) => (idSet.has(u.id) ? { ...u, status: "suspended" } : u))
      );
      setToast({
        kind: "success",
        text: `Suspended ${bulkIntent.ids.length} admins.`,
      });
    } else if (bulkIntent.kind === "reactivate") {
      setUsers((prev) =>
        prev.map((u) => (idSet.has(u.id) ? { ...u, status: "active" } : u))
      );
      setToast({
        kind: "success",
        text: `Reactivated ${bulkIntent.ids.length} admins.`,
      });
    } else if (bulkIntent.kind === "change_role") {
      setUsers((prev) =>
        prev.map((u) =>
          idSet.has(u.id) ? { ...u, role: bulkIntent.role } : u
        )
      );
      setToast({
        kind: "success",
        text: `Changed role to ${roleLabel(bulkIntent.role)} for ${
          bulkIntent.ids.length
        } admins.`,
      });
    }
    setSelectedIds([]);
    setBulkIntent(null);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    if (format !== "csv") return;
    const csv = adminUsersToCsv(filtered);
    downloadCsv(
      `atlas-admin-users-${new Date().toISOString().slice(0, 10)}.csv`,
      csv
    );
  };

  const headerMeta = useMemo(() => {
    const active = users.filter((u) => u.status === "active").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    const pending = users.filter((u) => u.status === "pending").length;
    const twoFactorOn = users.filter((u) =>
      twoFactorByAdminId.get(u.id)
    ).length;

    return (
      <>
        <span>{users.length} admins</span>
        <span aria-hidden="true">·</span>
        <span>{active} active</span>
        {pending > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-warning-700 dark:text-warning-300">
              {pending} pending
            </span>
          </>
        )}
        {suspended > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-danger-700 dark:text-danger-300">
              {suspended} suspended
            </span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>{twoFactorOn} with 2FA</span>
      </>
    );
  }, [users, twoFactorByAdminId]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin users"
        description="Internal staff directory and access control."
        meta={headerMeta}
        actions={
          <>
            <ExportMenu onExport={handleExport} formats={["csv"]} />
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              Invite admin
            </Button>
          </>
        }
      />

      <AdminUserSummaryCards
        users={users}
        activeStatus={filters.status}
        activeRole={filters.role}
        onSelectStatus={(status) =>
          setFilters({ status, role: "", page: "1" })
        }
        onSelectRole={(role) => setFilters({ role, status: "", page: "1" })}
      />

      <AdminUserFilters
        values={filters}
        hasActive={hasActive}
        searchInputRef={searchInputRef}
        onChange={(patch) => setFilters(patch)}
        onClear={clearFilters}
      />

      {selectedIds.length > 0 ? (
        <AdminUserToolbar
          selectedCount={selectedIds.length}
          onSuspend={handleBulkSuspend}
          onReactivate={handleBulkReactivate}
          onChangeRole={handleBulkChangeRole}
          onSendNotification={handleBulkSendNotification}
          onExportCsv={handleBulkExport}
          onClear={() => setSelectedIds([])}
        />
      ) : (
        <p
          aria-live="polite"
          className="text-xs text-neutral-500 dark:text-neutral-400"
        >
          {filtered.length} admin{filtered.length === 1 ? "" : "s"}
          {hasActive ? " (filtered)" : ""}
        </p>
      )}

      {loading ? (
        <div
          aria-busy="true"
          aria-label="Loading admin users"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {hasActive ? (
            <EmptyState
              variant="no_results"
              title="No admins match these filters"
              description="Try a different search or clear the filters."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              variant="no_data"
              title="No admin users yet"
              description="Invite your first admin to get started."
              action={
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  Invite admin
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <>
          <ul
            role="list"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {paginated.map((user) => {
              const queueNames = user.queueIds
                .map((id) => queueNameById.get(id))
                .filter((name): name is string => Boolean(name));
              return (
                <li key={user.id}>
                  <AdminUserCard
                    user={user}
                    isSelected={selectedIds.includes(user.id)}
                    isFocused={focusedId === user.id}
                    twoFactorEnabled={
                      twoFactorByAdminId.get(user.id) ?? false
                    }
                    queueNames={queueNames}
                    onToggleSelect={handleToggleSelect}
                    onOpen={setSelectedId}
                    onFocus={setFocusedId}
                  />
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <nav
              aria-label="Admin user pagination"
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Page {safePage} of {totalPages} · {filtered.length} admins
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setFilters({ page: String(safePage - 1) })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setFilters({ page: String(safePage + 1) })}
                >
                  Next
                </Button>
              </div>
            </nav>
          )}
        </>
      )}

      <AdminUserDetailDrawer
        user={selected}
        currentAdminId={CURRENT_ADMIN_ID}
        twoFactorEnabled={
          selected ? twoFactorByAdminId.get(selected.id) ?? false : false
        }
        queueNames={
          selected
            ? selected.queueIds
                .map((id) => queueNameById.get(id))
                .filter((name): name is string => Boolean(name))
            : []
        }
        onClose={() => setSelectedId(null)}
        onChangeRole={handleChangeRole}
        onUpdatePermissions={handleUpdatePermissions}
        onToggleStatus={handleToggleStatus}
        onResetPassword={handleResetPassword}
        onResendInvite={handleResendInvite}
        onDelete={handleDelete}
        onSendNotification={handleSendNotification}
      />

      <AdminUserInviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />

      <ConfirmDialog
        open={bulkIntent !== null}
        title={
          bulkIntent?.kind === "suspend"
            ? `Suspend ${bulkIntent.ids.length} admins?`
            : bulkIntent?.kind === "reactivate"
            ? `Reactivate ${bulkIntent.ids.length} admins?`
            : bulkIntent?.kind === "change_role"
            ? `Change role for ${bulkIntent.ids.length} admins?`
            : ""
        }
        description={
          bulkIntent?.kind === "suspend"
            ? "The selected admins will be signed out and blocked from signing in until reactivated."
            : bulkIntent?.kind === "reactivate"
            ? "The selected admins will be able to sign in again."
            : bulkIntent?.kind === "change_role"
            ? `All selected admins will be set to ${roleLabel(
                bulkIntent.role
              )}. Inherited permissions update automatically; extra grants are preserved.`
            : ""
        }
        confirmLabel="Confirm"
        danger={bulkIntent?.kind === "suspend"}
        onConfirm={confirmBulk}
        onCancel={() => setBulkIntent(null)}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "flex items-center justify-between gap-3 rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "flex items-center justify-between gap-3 rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          }
        >
          <span>{toast.text}</span>
          {toast.onUndo && (
            <Button variant="ghost" size="sm" onClick={handleUndo}>
              Undo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}