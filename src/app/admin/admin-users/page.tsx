/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUserSummaryCards } from "@/components/admin/admin-users/admin-user-summary-cards";
import { AdminUserFilters } from "@/components/admin/admin-users/admin-user-filters";
import { AdminUserCard } from "@/components/admin/admin-users/admin-user-card";
import { AdminUserDetailDrawer } from "@/components/admin/admin-users/admin-user-detail-drawer";
import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { SavedViews, type SavedView } from "@/components/admin/ui/saved-views";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import { mockAdminUsers } from "@/lib/admin/mock/admin-users";
import { AdminUser, AdminRole } from "@/lib/admin/types/admin-user";

const PAGE_SIZE = 12;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [bulkAction, setBulkAction] = useState<"suspend" | "export" | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  const [filters, setFilters] = useState<{
    search: string;
    role: string;
    status: string;
  }>({
    search: "",
    role: "",
    status: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setUsers(mockAdminUsers);
      setLoading(false);
    }, 500);
  }, []);

  // Load saved views
  useEffect(() => {
    try {
      const stored = localStorage.getItem("atlas-admin-user-views");
      if (stored) setSavedViews(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("atlas-admin-user-views", JSON.stringify(savedViews));
  }, [savedViews]);

  // Filter
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (
        filters.search &&
        !u.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !u.email.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.role && u.role !== filters.role) return false;
      if (filters.status && u.status !== filters.status) return false;
      return true;
    });
  }, [users, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginated = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Summary
  const summaryData = {
    totalAdmins: users.length,
    activeAdmins: users.filter((u) => u.status === "active").length,
    suspendedAdmins: users.filter((u) => u.status === "suspended").length,
    rolesCount: new Set(users.map((u) => u.role)).size,
    lastLogin:
      users.length > 0
        ? new Date(
            Math.max(
              ...users
                .filter((u) => u.lastLogin)
                .map((u) => new Date(u.lastLogin!).getTime())
            )
          ).toLocaleString()
        : "—",
  };

  // Handlers
  const filterByStatus = (status: string) => {
    setFilters((prev) => ({ ...prev, status }));
    setPage(1);
  };

  const filterByRole = (role: string) => {
    setFilters((prev) => ({ ...prev, role }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ search: "", role: "", status: "" });
    setPage(1);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export admin users as ${format}`);
  };

  const handleSaveView = (name: string) => {
    setSavedViews((prev) => [...prev, { name, filters }]);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters);
  };

  const handleDeleteView = (name: string) => {
    setSavedViews((prev) => prev.filter((v) => v.name !== name));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleChangeRole = (id: string, role: AdminRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role } : u))
    );
  };

  const handleUpdatePermissions = (id: string, permissions: string[]) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, permissions } : u))
    );
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status:
                u.status === "active"
                  ? ("suspended" as const)
                  : ("active" as const),
            }
          : u
      )
    );
  };

  const handleResetPassword = (id: string) => {
    console.log(`Password reset link sent to admin ${id}`);
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setSelectedUser(null);
  };

  const handleSendNotification = (
    id: string,
    channel: string,
    message: string
  ) => {
    console.log(`Sent ${channel} to ${id}: ${message}`);
  };

  const handleBulkAction = () => {
    if (bulkAction === "suspend") {
      setUsers((prev) =>
        prev.map((u) =>
          selectedIds.includes(u.id)
            ? { ...u, status: "suspended" as const }
            : u
        )
      );
    } else if (bulkAction === "export") {
      console.log(`Export selected admin users:`, selectedIds);
    }
    setSelectedIds([]);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Admin Users"
        description="Internal staff directory and access control."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <AdminUserSummaryCards
        users={users}
        onFilterAll={resetFilters}
        onFilterActive={() => filterByStatus("active")}
        onFilterSuspended={() => filterByStatus("suspended")}
        onFilterSuperAdmin={() => filterByRole("super_admin")}
      />

      <SavedViews
        views={savedViews}
        onLoad={handleLoadView}
        onDelete={handleDeleteView}
        onSave={handleSaveView}
      />

      <AdminUserFilters onFilterChange={handleFilterChange} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {selectedIds.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedIds.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkAction("suspend");
                setShowBulkConfirm(true);
              }}
            >
              <AtlasIcon name="x-circle" className="mr-1 h-3.5 w-3.5" />
              Suspend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBulkAction("export");
                setShowBulkConfirm(true);
              }}
            >
              Export Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear
            </Button>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">
            {filteredUsers.length} admin
            {filteredUsers.length === 1 ? "" : "s"}
            {Object.values(filters).some((v) => v) ? " (filtered)" : ""}
          </span>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : paginated.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <AtlasIcon
            name="shield"
            className="mx-auto h-8 w-8 text-neutral-400"
          />
          <p className="mt-2 text-sm text-neutral-500">
            No admin users match your filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={resetFilters}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((user) => (
              <div key={user.id} className="relative">
                <input
                  type="checkbox"
                  className="absolute left-3 top-3 z-10 h-4 w-4"
                  checked={selectedIds.includes(user.id)}
                  onChange={() => toggleSelect(user.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <AdminUserCard
                  user={user}
                  isSelected={selectedIds.includes(user.id)}
                  onClick={setSelectedUser}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail drawer */}
      <AdminUserDetailDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onChangeRole={handleChangeRole}
        onUpdatePermissions={handleUpdatePermissions}
        onToggleStatus={handleToggleStatus}
        onResetPassword={handleResetPassword}
        onDelete={handleDelete}
        onSendNotification={handleSendNotification}
      />

      {/* Bulk confirm */}
      <ConfirmDialog
        open={showBulkConfirm}
        title={`Confirm ${bulkAction ?? ""}`}
        description={`Are you sure you want to ${bulkAction} ${selectedIds.length} admin${
          selectedIds.length === 1 ? "" : "s"
        }?`}
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