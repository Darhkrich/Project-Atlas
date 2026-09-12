// components/admin/admin-users/admin-user-permissions-editor.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import {
  effectivePermissions as computeEffective,
  diffPermissions,
  isPrivilegeEscalation,
  roleLabel,
  type Permission,
  type Role,
} from "@/lib/admin/rbac";
import { permissionsByModule, inheritedPermissionsFor } from "@/lib/admin/admin-users/permissions";

interface AdminUserPermissionsEditorProps {
  role: Role;
  extraPermissions: Permission[];
  onSave: (extraPermissions: Permission[]) => void;
  onCancel: () => void;
}

export function AdminUserPermissionsEditor({
  role,
  extraPermissions,
  onSave,
  onCancel,
}: AdminUserPermissionsEditorProps) {
  const [draftExtra, setDraftExtra] = useState<Permission[]>(extraPermissions);
  const [search, setSearch] = useState("");

  const inherited = useMemo(() => inheritedPermissionsFor(role), [role]);
  const inheritedSet = useMemo(() => new Set(inherited), [inherited]);

  const currentEffective = useMemo(
    () => computeEffective({ role, extraPermissions }),
    [role, extraPermissions]
  );
  const draftEffective = useMemo(
    () => computeEffective({ role, extraPermissions: draftExtra }),
    [role, draftExtra]
  );

  const groups = useMemo(
    () => permissionsByModule(draftEffective, inherited),
    [draftEffective, inherited]
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (p) =>
            p.value.toLowerCase().includes(q) ||
            p.label.toLowerCase().includes(q) ||
            group.label.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [groups, search]);

  const diff = useMemo(
    () => diffPermissions(currentEffective, draftEffective),
    [currentEffective, draftEffective]
  );
  const hasChanges = diff.added.length > 0 || diff.removed.length > 0;
  const escalating = useMemo(
    () => isPrivilegeEscalation(currentEffective, draftEffective),
    [currentEffective, draftEffective]
  );

  const toggleExtra = (perm: Permission) => {
    if (inheritedSet.has(perm)) return;
    setDraftExtra((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleModuleExtras = (perms: Permission[]) => {
    const addable = perms.filter((p) => !inheritedSet.has(p));
    if (addable.length === 0) return;
    const allSelected = addable.every((p) => draftExtra.includes(p));
    if (allSelected) {
      setDraftExtra((prev) => prev.filter((p) => !addable.includes(p)));
    } else {
      setDraftExtra((prev) => Array.from(new Set([...prev, ...addable])));
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900/60">
        <p className="font-medium text-neutral-700 dark:text-neutral-300">
          Inherited from {roleLabel(role)}
        </p>
        <p className="mt-0.5 text-neutral-500 dark:text-neutral-400">
          {inherited.length} permissions apply automatically. Add extra grants
          below when this admin needs more than the role provides.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            aria-label="Search permissions"
            placeholder="Search modules or permissions"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDraftExtra(extraPermissions)}
          disabled={!hasChanges}
        >
          Reset
        </Button>
        <Button
          size="sm"
          onClick={() => onSave(draftExtra)}
          disabled={!hasChanges}
        >
          Save extras
        </Button>
      </div>

      {hasChanges && (
        <div
          className={cn(
            "rounded-md border p-3 text-xs",
            escalating
              ? "border-danger-200 bg-danger-50 text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
              : "border-warning-200 bg-warning-50 text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/25 dark:text-warning-100"
          )}
        >
          <p className="font-medium">
            {escalating
              ? "Warning: this change grants more access than it removes."
              : "Unsaved changes to extra permissions"}
          </p>
          <ul className="mt-1 space-y-0.5">
            {diff.added.length > 0 && (
              <li>+{diff.added.length} added</li>
            )}
            {diff.removed.length > 0 && (
              <li>-{diff.removed.length} removed</li>
            )}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {filteredGroups.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No permissions match your search.
          </p>
        ) : (
          filteredGroups.map((group) => {
            const addable = group.permissions.filter((p) => !p.inherited);
            const addableValues = addable.map((p) => p.value);
            const allExtrasSelected =
              addableValues.length > 0 &&
              addableValues.every((p) => draftExtra.includes(p));

            return (
              <div
                key={group.module}
                className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {group.label}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {group.description}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                      {group.inheritedCount} inherited
                      {group.extraCount > 0 &&
                        ` + ${group.extraCount} extra`}
                    </p>
                  </div>
                  {addableValues.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleModuleExtras(addableValues)}
                      className="shrink-0 text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
                    >
                      {allExtrasSelected ? "Clear extras" : "Grant all extras"}
                    </button>
                  )}
                </div>

                <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {group.permissions.map((perm) => {
                    const isExtra = draftExtra.includes(perm.value);
                    return (
                      <li key={perm.value}>
                        <label
                          className={cn(
                            "flex items-center gap-2 text-xs",
                            perm.inherited
                              ? "cursor-not-allowed opacity-70"
                              : "cursor-pointer"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={perm.inherited || isExtra}
                            disabled={perm.inherited}
                            onChange={() => toggleExtra(perm.value)}
                            className="h-4 w-4"
                          />
                          <span
                            className={
                              perm.inherited || isExtra
                                ? "text-neutral-900 dark:text-neutral-100"
                                : "text-neutral-600 dark:text-neutral-400"
                            }
                          >
                            {perm.label}
                          </span>
                          {perm.inherited ? (
                            <Badge variant="neutral" size="sm">
                              Role
                            </Badge>
                          ) : isExtra ? (
                            <Badge variant="brand" size="sm">
                              Extra
                            </Badge>
                          ) : null}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}