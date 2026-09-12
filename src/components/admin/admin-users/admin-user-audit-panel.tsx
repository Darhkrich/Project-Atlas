// components/admin/admin-users/admin-user-audit-panel.tsx
"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import type { AdminUser } from "@/lib/admin/types/admin-user";

interface AdminUserAuditPanelProps {
  user: AdminUser;
}

export function AdminUserAuditPanel({ user }: AdminUserAuditPanelProps) {
  const now = useNow();
  const entries = user.activityLog.slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Recent activity
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          The last few actions this admin performed. The full immutable record
          lives in Audit Logs.
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No activity recorded for this admin yet.
        </p>
      ) : (
        <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
          {entries.map((entry) => (
            <li key={entry.id} className="relative">
              <span
                className="absolute -left-[29px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-info-500 dark:border-neutral-900"
                aria-hidden="true"
              >
                <AtlasIcon name="record" className="h-2 w-2 text-white" />
              </span>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {entry.action}
              </p>
              {entry.resource && (
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {entry.resource}
                </p>
              )}
              <time
                dateTime={entry.timestamp}
                title={formatAbsolute(entry.timestamp)}
                className="mt-0.5 block text-xs text-neutral-400 dark:text-neutral-500"
              >
                {formatRelative(entry.timestamp, now)}
              </time>
            </li>
          ))}
        </ol>
      )}

      <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900/60">
        <Link
          href={`/admin/audit-logs?admin=${encodeURIComponent(user.email)}`}
          className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          View full audit trail in Audit Logs
        </Link>
      </div>
    </div>
  );
}