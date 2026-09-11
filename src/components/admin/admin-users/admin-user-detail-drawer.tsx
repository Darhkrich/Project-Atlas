/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import {
  AdminUser,
  ADMIN_ROLES,
  AdminRole,
  ALL_ADMIN_PERMISSIONS,
} from "@/lib/admin/types/admin-user";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";

interface AdminUserDetailDrawerProps {
  user: AdminUser | null;
  onClose: () => void;
  onChangeRole?: (id: string, role: AdminRole) => void;
  onUpdatePermissions?: (id: string, permissions: string[]) => void;
  onToggleStatus?: (id: string) => void;
  onResetPassword?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSendNotification?: (id: string, channel: string, message: string) => void;
}

type Tab = "overview" | "permissions" | "sessions" | "activity";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "permissions", label: "Permissions" },
  { key: "sessions", label: "Sessions" },
  { key: "activity", label: "Activity" },
];

const roleBadgeVariant: Record<
  string,
  "brand" | "info" | "warning" | "success" | "danger" | "neutral"
> = {
  super_admin: "brand",
  operations_admin: "info",
  finance_admin: "warning",
  support_admin: "success",
  service_admin: "neutral",
  analyst: "neutral",
};

export function AdminUserDetailDrawer({
  user,
  onClose,
  onChangeRole,
  onUpdatePermissions,
  onToggleStatus,
  onResetPassword,
  onDelete,
  onSendNotification,
}: AdminUserDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedRole, setSelectedRole] = useState<AdminRole>(
    user?.role || "analyst"
  );
  const [permissions, setPermissions] = useState<string[]>(
    user?.permissions || []
  );
  const [search, setSearch] = useState("");

  const [confirmAction, setConfirmAction] = useState<
    "suspend" | "reactivate" | "reset_password" | "delete" | "change_role" | "save_permissions" | null
  >(null);

  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyChannel, setNotifyChannel] = useState<"email" | "sms" | "push">(
    "email"
  );
  const [notifyMessage, setNotifyMessage] = useState("");

  // Sync state when user changes
  useEffect(() => {
    setSelectedRole(user?.role || "analyst");
    setPermissions(user?.permissions || []);
  }, [user]);

  if (!user) return null;

  const roleLabel =
    ADMIN_ROLES.find((r) => r.value === user.role)?.label || user.role;

  const hasRoleChanged = selectedRole !== user.role;
  const hasPermissionsChanged =
    JSON.stringify([...permissions].sort()) !==
    JSON.stringify([...user.permissions].sort());

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleModuleAll = (modulePerms: string[]) => {
    const allSelected = modulePerms.every((p) => permissions.includes(p));
    if (allSelected) {
      setPermissions((prev) => prev.filter((p) => !modulePerms.includes(p)));
    } else {
      setPermissions((prev) => [...new Set([...prev, ...modulePerms])]);
    }
  };

  const handleSendNotification = () => {
    if (onSendNotification)
      onSendNotification(user.id, notifyChannel, notifyMessage);
    setShowNotifyModal(false);
    setNotifyMessage("");
  };

  const filteredPermissions = ALL_ADMIN_PERMISSIONS.filter((group) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      group.module.toLowerCase().includes(q) ||
      group.permissions.some((p) => p.toLowerCase().includes(q))
    );
  });

  // Mock sessions for display
  const mockSessions = [
    {
      id: "SESS-1",
      device: "Chrome on Windows",
      ip: "154.160.1.1",
      lastActive: user.lastLogin || new Date().toISOString(),
      current: true,
    },
    {
      id: "SESS-2",
      device: "Safari on iPhone",
      ip: "197.251.0.1",
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      current: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-neutral-500">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <Badge variant={user.status === "active" ? "success" : "danger"}>
            {user.status}
          </Badge>
          <Badge variant={roleBadgeVariant[user.role]}>{roleLabel}</Badge>
          <Badge variant="info">{user.permissions.length} permissions</Badge>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium",
                activeTab === tab.key
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Identity */}
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500">
                  Identity
                </p>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">User ID</span>
                    <span className="font-mono text-xs">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email</span>
                    <span className="text-xs">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Created</span>
                    <span className="text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Last Login</span>
                    <span className="text-xs">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role change */}
              <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                <p className="text-xs font-medium text-neutral-500">
                  Role Assignment
                </p>
                <div className="mt-2 flex gap-2">
                  <select
                    className="h-10 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    value={selectedRole}
                    onChange={(e) =>
                      setSelectedRole(e.target.value as AdminRole)
                    }
                  >
                    {ADMIN_ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasRoleChanged}
                    onClick={() => setConfirmAction("change_role")}
                  >
                    Update Role
                  </Button>
                </div>
                {hasRoleChanged && (
                  <p className="mt-2 text-xs text-warning-600">
                    Role will change from{" "}
                    <strong>{roleLabel}</strong> to{" "}
                    <strong>
                      {ADMIN_ROLES.find((r) => r.value === selectedRole)?.label}
                    </strong>
                  </p>
                )}
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Activity Events</p>
                  <p className="mt-1 text-lg font-bold">
                    {user.activityLog.length}
                  </p>
                </div>
                <div className="rounded-md bg-neutral-50 p-3 dark:bg-neutral-900">
                  <p className="text-xs text-neutral-500">Permissions</p>
                  <p className="mt-1 text-lg font-bold">
                    {user.permissions.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <AtlasIcon
                    name="search"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  />
                  <Input
                    placeholder="Search permissions..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPermissionsChanged}
                  onClick={() => setConfirmAction("save_permissions")}
                >
                  Save
                </Button>
              </div>

              {hasPermissionsChanged && (
                <p className="rounded-md bg-warning-50 p-2 text-xs text-warning-700 dark:bg-warning-900/20 dark:text-warning-300">
                  Permissions have unsaved changes.
                </p>
              )}

              {filteredPermissions.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No permissions match your search.
                </p>
              ) : (
                filteredPermissions.map((group) => {
                  const allSelected = group.permissions.every((p) =>
                    permissions.includes(p)
                  );
                  return (
                    <div
                      key={group.module}
                      className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium capitalize">
                          {group.module.replace(/_/g, " ")}
                        </p>
                        <button
                          onClick={() => toggleModuleAll(group.permissions)}
                          className="text-xs font-medium text-brand-600 hover:underline"
                        >
                          {allSelected ? "Deselect all" : "Select all"}
                        </button>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {group.permissions.map((perm) => (
                          <li key={perm}>
                            <label className="flex cursor-pointer items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={permissions.includes(perm)}
                                onChange={() => togglePermission(perm)}
                                className="h-4 w-4"
                              />
                              <span>{perm}</span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-neutral-500">
                Active Sessions
              </p>
              {mockSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-neutral-50 p-3 text-sm dark:bg-neutral-900"
                >
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-xs text-neutral-500">
                      {session.ip} ·{" "}
                      {new Date(session.lastActive).toLocaleString()}
                    </p>
                  </div>
                  {session.current ? (
                    <Badge variant="success">Current</Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      End Session
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-neutral-500">
                Activity Log
              </p>
              {user.activityLog.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No activity recorded.
                </p>
              ) : (
                <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
                  {user.activityLog.map((act) => (
                    <li key={act.id} className="relative">
                      <span className="absolute -left-[29px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-info-500 dark:border-neutral-900">
                        <AtlasIcon name="record" className="h-2 w-2 text-white" />
                      </span>
                      <p className="text-sm font-medium">{act.action}</p>
                      {act.resource && (
                        <p className="text-xs text-neutral-500">
                          {act.resource}
                        </p>
                      )}
                      <p className="text-xs text-neutral-400">
                        {new Date(act.timestamp).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifyModal(true)}
          >
            Send Notification
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction("reset_password")}
          >
            Reset Password
          </Button>
          {user.status === "active" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmAction("suspend")}
            >
              Suspend
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction("reactivate")}
            >
              Reactivate
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-danger-600"
            onClick={() => setConfirmAction("delete")}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Send Notification modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowNotifyModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Send Notification</h3>
            <div className="mt-4 space-y-3">
              <select
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                value={notifyChannel}
                onChange={(e) =>
                  setNotifyChannel(e.target.value as "email" | "sms" | "push")
                }
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push Notification</option>
              </select>
              <textarea
                className="w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                rows={4}
                placeholder="Message..."
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifyModal(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSendNotification}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action confirmation */}
      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${
          confirmAction === "change_role"
            ? "Role Change"
            : confirmAction === "save_permissions"
            ? "Save Permissions"
            : confirmAction
            ? confirmAction
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : ""
        }`}
        description={
          confirmAction === "change_role"
            ? `Change ${user.name}'s role from ${
                ADMIN_ROLES.find((r) => r.value === user.role)?.label
              } to ${
                ADMIN_ROLES.find((r) => r.value === selectedRole)?.label
              }?`
            : confirmAction === "save_permissions"
            ? `Save ${permissions.length} permissions for ${user.name}?`
            : `Are you sure you want to ${
                confirmAction ? confirmAction.replace(/_/g, " ") : ""
              } ${user.name}?`
        }
        confirmLabel="Confirm"
        danger={
          confirmAction === "suspend" ||
          confirmAction === "delete"
        }
        onConfirm={() => {
          if (confirmAction === "change_role" && onChangeRole)
            onChangeRole(user.id, selectedRole);
          if (confirmAction === "save_permissions" && onUpdatePermissions)
            onUpdatePermissions(user.id, permissions);
          if (
            (confirmAction === "suspend" || confirmAction === "reactivate") &&
            onToggleStatus
          )
            onToggleStatus(user.id);
          if (confirmAction === "reset_password" && onResetPassword)
            onResetPassword(user.id);
          if (confirmAction === "delete" && onDelete) onDelete(user.id);
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}