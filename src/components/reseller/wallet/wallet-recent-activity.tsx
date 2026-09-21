"use client";

import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { Button } from "@/components/atlas/button";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import type { ResellerLedgerRow } from "@/lib/reseller/types/wallet";

interface Props {
  rows: ResellerLedgerRow[];
  nowMs: number | null;
  onFund: () => void;
}

export function WalletRecentActivity({ rows, nowMs, onFund }: Props) {
  return (
    <section aria-labelledby="reseller-recent-activity-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="reseller-recent-activity-heading"
          className="text-lg font-semibold text-neutral-950 dark:text-white"
        >
          Recent activity
        </h2>
        <Link
          href="/reseller/transactions"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300"
        >
          View all
        </Link>
      </div>

      <AtlasCard padding="none" className="overflow-hidden">
        {rows.length === 0 ? (
          <AtlasEmptyState
            title="No activity yet"
            description="Your wallet activity will appear here."
            action={
              <Button variant="outline" onClick={onFund}>
                Fund wallet
              </Button>
            }
          />
        ) : (
          <ul role="list" className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <AtlasBadge variant={row.kindVariant}>{row.kindLabel}</AtlasBadge>
                    <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                      {row.description}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {row.detail}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                    {formatCurrency(row.total ?? row.amount)}
                  </p>
                  {row.fee !== undefined && row.fee > 0 && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      incl. {formatCurrency(row.fee)} fee
                    </p>
                  )}
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {nowMs ? formatRelative(row.createdAt, nowMs) : "\u2014"}
                  </p>
                  {row.statusLabel && row.statusVariant && (
                    <div className="mt-1">
                      <AtlasBadge variant={row.statusVariant} size="sm">
                        {row.statusLabel}
                      </AtlasBadge>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </AtlasCard>
    </section>
  );
}