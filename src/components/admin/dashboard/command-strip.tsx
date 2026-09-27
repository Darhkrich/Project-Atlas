"use client";

import Link from "next/link";
import { AttentionStrip } from "./attention-strip";
import type { AttentionItem } from "@/lib/admin/dashboard/dashboard-projection";

export function CommandStrip({
  items,
}: {
  items: AttentionItem[];
}) {
  if (items.length === 0) {
    return (
      <div
        role="status"
        className="flex items-center justify-between rounded-xl border border-success-200 bg-success-50 p-4 text-sm text-success-900 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
      >
        <span>
          Nothing needs your attention right now. Every queue is clear for
          your role.
        </span>
        <Link
          href="/admin/audit-logs"
          className="text-xs font-medium underline"
        >
          Recent activity
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AttentionStrip items={items} />
      <div className="flex justify-end">
        <Link
          href="/admin/audit-logs"
          className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          View all recent activity
        </Link>
      </div>
    </div>
  );
}