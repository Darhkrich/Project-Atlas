// components/admin/settings/settings-audit-panel.tsx
"use client";

import { useMemo } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { groupAuditByDay } from "@/lib/admin/settings/audit";
import {
  SETTINGS_TABS,
  fieldLabel,
} from "@/lib/admin/settings/constant";
import type { SettingsAuditEntry } from "@/lib/admin/types/settings";

interface SettingsAuditPanelProps {
  entries: SettingsAuditEntry[];
  open: boolean;
  onClose: () => void;
}

export function SettingsAuditPanel({
  entries,
  open,
  onClose,
}: SettingsAuditPanelProps) {
  const now = useNow();
  const groups = useMemo(() => groupAuditByDay(entries), [entries]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Settings audit log"
        className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold">Settings audit log</h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              Recent changes to platform settings.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {groups.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No settings changes recorded yet.
            </p>
          ) : (
            groups.map((group) => (
              <section key={group.day}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {group.day}
                </p>
                <ul className="space-y-2">
                  {group.entries.map((entry) => {
                    const tabLabel =
                      SETTINGS_TABS.find((t) => t.key === entry.tab)?.label ??
                      entry.tab;
                    return (
                      <li
                        key={entry.id}
                        className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="neutral" size="sm">
                            {tabLabel}
                          </Badge>
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">
                            {fieldLabel(entry.field)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-neutral-600 dark:text-neutral-400">
                          <span className="line-through">
                            {entry.previousValue}
                          </span>
                          <span aria-hidden="true">→</span>
                          <span className="font-medium text-neutral-900 dark:text-neutral-100">
                            {entry.newValue}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-500 dark:text-neutral-400">
                          <span>{entry.actorName}</span>
                          <time
                            dateTime={entry.at}
                            title={formatAbsolute(entry.at)}
                          >
                            {formatRelative(entry.at, now)}
                          </time>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}