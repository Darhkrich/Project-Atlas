"use client";

import Link from "next/link";
import { useState } from "react";
import type { ResellerTier } from "@/lib/admin/types/commission";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTime } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import { projectRateRows } from "@/lib/admin/resellers/tier-projection";
import {
  getTierAuditFor,
  type TierAuditEntry,
} from "@/lib/admin/mock/reseller-tier-store";

interface TierCardProps {
  tier: ResellerTier;
  resellerCount: number;
  onEdit: (tier: ResellerTier) => void;
  onDelete: (tier: ResellerTier) => void;
}

export function TierCard({
  tier,
  resellerCount,
  onEdit,
  onDelete,
}: TierCardProps) {
  const now = useNow();
  const [historyOpen, setHistoryOpen] = useState(false);
  const rateRows = projectRateRows(tier);
  const history: TierAuditEntry[] = historyOpen ? getTierAuditFor(tier.id) : [];

  const deleteDisabled = resellerCount > 0;

  const resellerWord = resellerCount === 1 ? "reseller" : "resellers";
  const verbWord = resellerCount === 1 ? "is" : "are";
  const deleteButtonTitle = deleteDisabled
    ? resellerCount +
      " " +
      resellerWord +
      " " +
      verbWord +
      " on this tier. Reassign them before deleting."
    : undefined;
  const deleteButtonAriaLabel = deleteDisabled
    ? "Cannot delete " + tier.name + ". " + resellerCount + " resellers are assigned."
    : "Delete " + tier.name;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <CardTitle className="text-base">{tier.name}</CardTitle>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Min monthly revenue{" "}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {formatCurrency(tier.minMonthlySales)}
            </span>
          </p>
        </div>
        <Link
          href={"/admin/resellers?tier=" + tier.id}
          className="shrink-0 rounded-sm text-xs font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
          aria-label={
            "View " + resellerCount + " resellers on " + tier.name
          }
        >
          <Badge variant={resellerCount > 0 ? "info" : "neutral"} size="sm">
            {resellerCount} {resellerWord}
          </Badge>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-md border border-neutral-100 p-2 text-sm dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Extra cut
            </span>
            <span className="font-semibold">{tier.extraCutPercent}%</span>
          </div>
          <p className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">
            Atlas share of markup above Atlas price
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Base commission rates
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {rateRows.map((row) => (
              <div key={row.key} className="flex items-center justify-between">
                <dt className="text-neutral-500 dark:text-neutral-400">
                  {row.label}
                </dt>
                <dd className="font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
            All rates are a percentage of order value.
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Perks
          </p>
          {tier.perks.length === 0 ? (
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              No perks configured.
            </p>
          ) : (
            <ul role="list" className="space-y-0.5 text-xs">
              {tier.perks.map((perk) => (
                <li
                  key={perk}
                  className="flex items-start gap-1.5 text-neutral-700 dark:text-neutral-300"
                >
                  <AtlasIcon
                    name="check"
                    aria-hidden="true"
                    className="mt-0.5 h-3 w-3 shrink-0 text-success-600"
                  />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            aria-expanded={historyOpen}
            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <AtlasIcon
              name="chevron-down"
              aria-hidden="true"
              className={cn(
                "h-3 w-3 transition-transform",
                !historyOpen && "-rotate-90"
              )}
            />
            History
          </button>
          {historyOpen && (
            <div className="mt-2 space-y-1.5">
              {history.length === 0 ? (
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  No changes recorded yet.
                </p>
              ) : (
                <ul role="list" className="space-y-1.5 text-xs">
                  {history.slice(0, 3).map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-md bg-neutral-50 p-2 dark:bg-neutral-900"
                    >
                      <p className="font-medium">{entry.action}</p>
                      {entry.changes && entry.changes.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-neutral-500 dark:text-neutral-400">
                          {entry.changes.map((c) => (
                            <li key={c.field}>
                              {c.field}:{" "}
                              <span className="line-through">{c.from}</span> →{" "}
                              {c.to}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p
                        className="mt-1 text-neutral-400 dark:text-neutral-500"
                        title={formatDateTime(entry.timestamp)}
                      >
                        {entry.admin} ·{" "}
                        {now ? formatRelative(entry.timestamp, now) : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <Can permission={PERMISSIONS.RESELLERS_TIER}>
          <div className="flex gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <Button variant="outline" size="sm" onClick={() => onEdit(tier)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger-600"
              onClick={() => onDelete(tier)}
              disabled={deleteDisabled}
              title={deleteButtonTitle}
              aria-label={deleteButtonAriaLabel}
            >
              Delete
            </Button>
          </div>
        </Can>
      </CardContent>
    </Card>
  );
}