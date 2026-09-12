// components/admin/admin-users/admin-user-toolbar.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { ALL_ROLES, roleLabel, type Role } from "@/lib/admin/rbac";

interface AdminUserToolbarProps {
  selectedCount: number;
  onSuspend: () => void;
  onReactivate: () => void;
  onChangeRole: (role: Role) => void;
  onSendNotification: () => void;
  onExportCsv: () => void;
  onClear: () => void;
}

export function AdminUserToolbar({
  selectedCount,
  onSuspend,
  onReactivate,
  onChangeRole,
  onSendNotification,
  onExportCsv,
  onClear,
}: AdminUserToolbarProps) {
  const [rolePickerOpen, setRolePickerOpen] = useState(false);

  const label = `${selectedCount} admin${selectedCount === 1 ? "" : "s"} selected`;

  return (
    <div
      role="region"
      aria-label="Bulk admin user actions"
      className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/60 p-2 dark:border-brand-800/60 dark:bg-brand-900/20"
    >
      <span className="text-sm font-medium" aria-live="polite">
        {label}
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onReactivate}>
          Reactivate
        </Button>

        <Button variant="outline" size="sm" onClick={onSuspend}>
          <AtlasIcon name="x-circle" className="mr-1 h-3.5 w-3.5" />
          Suspend
        </Button>

        <Button
          variant={rolePickerOpen ? "primary" : "outline"}
          size="sm"
          aria-expanded={rolePickerOpen}
          onClick={() => setRolePickerOpen((v) => !v)}
        >
          Change role
        </Button>

        <Button variant="outline" size="sm" onClick={onSendNotification}>
          Send notification
        </Button>

        <Button variant="outline" size="sm" onClick={onExportCsv}>
          Export selected
        </Button>

        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>

      {rolePickerOpen && (
        <div className="w-full border-t border-brand-200 pt-2 dark:border-brand-800/60">
          <p className="mb-2 text-xs text-neutral-600 dark:text-neutral-400">
            Apply this role to all {selectedCount} selected admin
            {selectedCount === 1 ? "" : "s"}:
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((role) => (
              <Button
                key={role.value}
                variant="outline"
                size="sm"
                onClick={() => {
                  onChangeRole(role.value);
                  setRolePickerOpen(false);
                }}
              >
                {roleLabel(role.value)}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}