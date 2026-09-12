// components/admin/rbac/dev-role-switcher.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ALL_ROLES, rolePermissions, type Role } from "@/lib/admin/rbac";

interface DevRoleSwitcherProps {
  currentRole: Role;
  onChange: (role: Role) => void;
  onReset: () => void;
}

export function DevRoleSwitcher({
  currentRole,
  onChange,
  onReset,
}: DevRoleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    ALL_ROLES.find((r) => r.value === currentRole)?.label ?? currentRole;

  useEffect(() => {
    if (!open) return;

    const onDocClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2"
    >
      {open && (
        <div
          role="dialog"
          aria-label="Development role switcher"
          className="w-72 rounded-lg border border-neutral-300 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Dev: current role
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                Persisted in this browser. Not visible in production.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close role switcher"
              onClick={() => setOpen(false)}
              className="rounded px-1 text-xs text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              x
            </button>
          </div>

          <ul className="mt-3 space-y-1">
            {ALL_ROLES.map((role) => {
              const isActive = role.value === currentRole;
              const permCount = rolePermissions(role.value).length;
              return (
                <li key={role.value}>
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      onChange(role.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                      isActive
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                        : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    )}
                  >
                    <span className="truncate font-medium">{role.label}</span>
                    <span className="shrink-0 text-[10px] text-neutral-500 dark:text-neutral-400">
                      {permCount === 0 ? "0 perms" : `${permCount} perms`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-200 pt-2 dark:border-neutral-800">
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Active: <span className="font-medium">{currentLabel}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                onReset();
                setOpen(false);
              }}
              className="text-[11px] font-medium text-brand-700 hover:underline dark:text-brand-300"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-warning-400"
          aria-hidden="true"
        />
        DEV · {currentLabel}
      </button>
    </div>
  );
}