/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { AdminUser, ADMIN_ROLES, ALL_ADMIN_PERMISSIONS } from "@/lib/admin/types/admin-user";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { Input } from "@/components/admin/ui/input";

interface AdminUserDetailDrawerProps {
  user: AdminUser | null;
  onClose: () => void;
}

type Tab = "overview" | "permissions" | "activity";

const tabs: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "permissions", label: "Permissions" },
  { key: "activity", label: "Activity" },
];

export function AdminUserDetailDrawer({ user, onClose }: AdminUserDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedRole, setSelectedRole] = useState<AdminUser["role"]>(user?.role || "analyst");
  const [confirmAction, setConfirmAction] = useState<"suspend" | "reactivate" | "reset_password" | "delete" | null>(null);

  if (!user) return null;

  const roleLabel = ADMIN_ROLES.find(r => r.value === user.role)?.label || user.role;

  const handleRoleChange = () => {
    console.log(`Change role for ${user.id} to ${selectedRole}`);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl dark:bg-neutral-900 flex flex-col">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Admin User Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        {/* Profile Header */}
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600">
              {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}
            </div>
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-sm text-neutral-500">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Badge variant={user.status === "active" ? "success" : "danger"}>{user.status}</Badge>
            <Badge variant="info">{roleLabel}</Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium",
                activeTab === tab.key
                  ? "border-b-2 border-brand-600 text-brand-600"
                  : "text-neutral-500 hover:text-neutral-700"
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
              <div>
                <p className="text-sm text-neutral-500">Role</p>
                <div className="flex items-center gap-2 mt-1">
                  <select
                    className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as AdminUser["role"])}
                  >
                    {ADMIN_ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm" onClick={handleRoleChange}>Update Role</Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Last Login</p>
                <p className="font-medium">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Created</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="space-y-4">
              {ALL_ADMIN_PERMISSIONS.map(group => (
                <div key={group.module}>
                  <p className="text-sm font-medium capitalize">{group.module}</p>
                  <ul className="mt-1 space-y-1">
                    {group.permissions.map(perm => (
                      <li key={perm} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={user.permissions.includes(perm)}
                          readOnly
                          className="h-4 w-4"
                        />
                        <span>{perm}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <p className="text-sm font-medium">Activity Log</p>
              <ul className="mt-2 space-y-2">
                {user.activityLog.length === 0 ? (
                  <li className="text-sm text-neutral-400">No activity recorded</li>
                ) : (
                  user.activityLog.map(act => (
                    <li key={act.id} className="text-sm">
                      {act.action} {act.resource && `(${act.resource})`} · {new Date(act.timestamp).toLocaleString()}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800 flex flex-wrap gap-2">
          {user.status === "active" ? (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction("suspend")}>Suspend</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirmAction("reactivate")}>Reactivate</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setConfirmAction("reset_password")}>Reset Password</Button>
          <Button variant="destructive" size="sm" onClick={() => setConfirmAction("delete")}>Delete</Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${confirmAction ? confirmAction.replace('_', ' ') : ''}`}
        description={`Are you sure you want to ${confirmAction ? confirmAction.replace('_', ' ') : ''} ${user.name}?`}
        confirmLabel="Confirm"
        danger={confirmAction === "suspend" || confirmAction === "delete"}
        onConfirm={() => {
          console.log(`${confirmAction} for ${user.id}`);
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}