/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
// components/admin/ui/assignee-picker.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import {
  mockAdminQueues,
  mockAdminUsers,
  type AdminQueue,
  type AdminUser,
} from "@/lib/admin/mock/admin-users";

interface AssigneePickerProps {
  value?: string;
  valueName?: string;
  admins?: AdminUser[];
  queues?: AdminQueue[];
  onChange: (adminId: string, admin: AdminUser | null) => void;
  disabled?: boolean;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AssigneePicker({
  value,
  valueName,
  admins = mockAdminUsers,
  queues = mockAdminQueues,
  onChange,
  disabled = false,
  className,
}: AssigneePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => admins.find((a) => a.id === value) ?? null,
    [admins, value]
  );

  const queueName = useMemo(() => {
    const map = new Map(queues.map((q) => [q.id, q.name]));
    return map;
  }, [queues]);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return admins.filter((a) => {
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    });
  }, [admins, query]);

  const displayName = selected?.name ?? valueName ?? "";

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onDocClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const close = (restoreFocus = true) => {
    setOpen(false);
    setQuery("");
    if (restoreFocus) buttonRef.current?.focus();
  };

  const select = (admin: AdminUser | null) => {
    onChange(admin?.id ?? "", admin);
    close();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      if (options.length === 0) return;
      event.preventDefault();
      select(options[activeIndex] ?? null);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex h-9 w-full items-center justify-between gap-2 rounded-md border border-neutral-300 bg-white px-2.5 text-left text-xs transition-colors hover:bg-neutral-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700/60"
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected || displayName ? (
            <>
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                aria-hidden="true"
              >
                {initials(displayName) || "?"}
              </span>
              <span className="truncate">{displayName}</span>
            </>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">
              Assign to…
            </span>
          )}
        </span>
        <span className="text-neutral-400" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Assign to"
          onKeyDown={onKeyDown}
          className="absolute right-0 z-30 mt-1 w-72 rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="border-b border-neutral-200 p-2 dark:border-neutral-800">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search admins…"
              aria-label="Search admins"
              className="h-8 text-xs"
            />
          </div>

          <ul className="max-h-64 overflow-y-auto py-1">
            <li>
              <button
                type="button"
                onClick={() => select(null)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  !value && "bg-neutral-50 dark:bg-neutral-800/60"
                )}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] text-neutral-500 dark:bg-neutral-700 dark:text-neutral-300"
                  aria-hidden="true"
                >
                  –
                </span>
                <span className="text-neutral-600 dark:text-neutral-300">
                  Unassigned
                </span>
              </button>
            </li>

            {options.length === 0 ? (
              <li className="px-3 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                No admins match "{query}".
              </li>
            ) : (
              options.map((admin, index) => {
                const isActive = index === activeIndex;
                const isSelected = admin.id === value;
                return (
                  <li key={admin.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => select(admin)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-xs",
                        isActive && "bg-neutral-100 dark:bg-neutral-800",
                        isSelected && "font-medium"
                      )}
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                        aria-hidden="true"
                      >
                        {initials(admin.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-neutral-900 dark:text-neutral-100">
                          {admin.name}
                        </span>
                        <span className="block truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                          {admin.queueIds
                            .map((q) => queueName.get(q) ?? q)
                            .join(" · ")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="flex items-center justify-end border-t border-neutral-200 p-2 dark:border-neutral-800">
            <Button variant="ghost" size="sm" onClick={() => close()}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}