/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUserSummaryCards } from "@/components/admin/admin-users/admin-user-summary-cards";
import { AdminUserCard } from "@/components/admin/admin-users/admin-user-card";
import { AdminUserDetailDrawer } from "@/components/admin/admin-users/admin-user-detail-drawer";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockAdminUsers } from "@/lib/admin/mock/admin-users";
import { AdminUser, ADMIN_ROLES } from "@/lib/admin/types/admin-user";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [bulkAction, setBulkAction] = useState<"suspend" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setUsers(mockAdminUsers);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-admin-user-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-admin-user-views", JSON.stringify(savedViews));
  }, [savedViews]);

  const filteredUsers = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    if (statusFilter && u.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const summaryData = {
    totalAdmins: users.length,
    activeAdmins: users.filter((u) => u.status === "active").length,
    suspendedAdmins: users.filter((u) => u.status === "suspended").length,
    rolesCount: new Set(users.map((u) => u.role)).size,
    lastLogin: users.length > 0 ? new Date(Math.max(...users.filter((u) => u.lastLogin).map((u) => new Date(u.lastLogin!).getTime()))).toLocaleString() : "—",
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Exporting admin users as ${format}`);
  };

  const handleSaveView = (name: string) => {
    const filters = { search, roleFilter, statusFilter };
    setSavedViews((prev) => [...prev, { name, filters }]);
  };

  const handleLoadView = (view: SavedView) => {
    setSearch(view.filters.search || "");
    setRoleFilter(view.filters.roleFilter || "");
    setStatusFilter(view.filters.statusFilter || "");
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const handleBulkAction = () => {
    console.log(`${bulkAction} for admin users:`, selectedIds);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Users"
        description="Internal staff directory and access control."
        actions={
          <>
            <ExportMenu onExport={handleExport} />
            <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
              Bulk Actions
            </Button>
          </>
        }
      />

      <AdminUserSummaryCards data={summaryData} />

      <SavedViews views={savedViews} onLoad={handleLoadView} onDelete={handleDeleteView} onSave={handleSaveView} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search admins..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {ADMIN_ROLES.map((role) => (
            <option key={role.value} value={role.value}>{role.label}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-neutral-500">Rows per page:</span>
          <select
            className="h-8 rounded-md border border-neutral-300 px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 dark:bg-neutral-900">
          <span className="text-sm">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("suspend"); setShowBulkConfirm(true); }}>Suspend</Button>
          <Button variant="outline" size="sm" onClick={() => { setBulkAction("export"); setShowBulkConfirm(true); }}>Export Selected</Button>
        </div>
      )}

      {/* User List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedUsers.map((user) => (
              <div key={user.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute top-3 left-3 z-10 h-4 w-4"
                  checked={selectedIds.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds((prev) => [...prev, user.id]);
                    } else {
                      setSelectedIds((prev) => prev.filter((id) => id !== user.id));
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <AdminUserCard
                  user={user}
                  isSelected={selectedIds.includes(user.id)}
                  onClick={(user) => setSelectedUser(user)}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}

      <AdminUserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />

      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ''}`}
        description={`Are you sure you want to ${bulkAction ?? ''} ${selectedIds.length} admin users?`}
        confirmLabel="Confirm"
        danger={bulkAction === "suspend"}
        onConfirm={handleBulkAction}
        onCancel={() => {
          setShowBulkConfirm(false);
          setBulkAction(null);
        }}
      />
    </div>
  );
}