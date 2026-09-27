"use client";

import Link from "next/link";
import { useAuditEntries } from "@/lib/admin/hooks/use-audit-entries";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative } from "@/lib/shared/format";

const ACTION_LABEL: Record<string, string> = {
  "catalog.category.create": "created a category",
  "catalog.category.update": "updated a category",
  "catalog.category.delete": "deleted a category",
  "catalog.category.reorder": "reordered categories",
  "catalog.plan.create": "created a plan",
  "catalog.plan.update": "updated a plan",
  "catalog.plan.delete": "deleted a plan",
  "catalog.plan.toggle": "toggled a plan",
  "catalog.pricing.update": "changed pricing",
  "treasury.period_close": "closed a treasury period",
  "treasury.adjustment": "recorded a treasury adjustment",
  "treasury.transfer_to_bank": "transferred treasury to bank",
  "treasury.fund": "funded treasury",
  "treasury.approve_outbound": "approved an outbound",
  "treasury.reject_outbound": "rejected an outbound",
  "refund.create_requested": "created a refund request",
  "refund.approve": "approved a refund",
  "refund.reject": "rejected a refund",
  "refund.process": "processed a refund",
  "refund.automatic": "an automatic refund fired",
  "payout_run.create": "created a payout run",
  "payout_run.complete": "completed a payout run",
  "payout_run.fail": "a payout run failed",
};

function labelFor(action: string): string {
  return ACTION_LABEL[action] ?? action.replace(/\./g, " ");
}

export function ActivityFeed({ limit = 10 }: { limit?: number }) {
  const entries = useAuditEntries();
  const now = useNow();

  const visible = entries.slice(0, limit);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Recent activity</h3>
        <Link
          href="/admin/audit-logs"
          className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          View audit log
        </Link>
      </div>

      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-neutral-500">
          No admin activity recorded yet this session.
        </p>
      ) : (
        <ul role="list" className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {visible.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start justify-between gap-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-neutral-900 dark:text-neutral-100">
                  <span className="font-medium">{entry.actorName}</span>{" "}
                  {labelFor(entry.action)}
                </p>
                <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {entry.resourceType}: {entry.resourceId}
                </p>
              </div>
              <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                {now ? formatRelative(entry.createdAt, now) : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}