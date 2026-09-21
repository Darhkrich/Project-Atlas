"use client";

import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { Button } from "@/components/atlas/button";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import type { MerchantLedgerRow } from "@/lib/merchant/types/wallet";

interface Props {
  title: string;
  rows: MerchantLedgerRow[];
  nowMs: number | null;
  viewAllHref: string;
  onFund: () => void;
}

const MAX_VISIBLE = 8;

export function WalletRecentActivity({
  title,
  rows,
  nowMs,
  viewAllHref,
  onFund,
}: Props) {
  const visible = rows.slice(0, MAX_VISIBLE);

  return (
    <section aria-labelledby="merchant-wallet-activity-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="merchant-wallet-activity-heading"
          className="text-lg font-semibold text-neutral-950 dark:text-white"
        >
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300"
        >
          View all
        </Link>
      </div>

      <AtlasCard padding="none" className="overflow-hidden">
        {visible.length === 0 ? (
          <AtlasEmptyState
            title="No activity yet"
            description="Transactions will appear here as they happen."
            action={
              <Button variant="outline" onClick={onFund}>
                Fund wallet
              </Button>
            }
          />
        ) : (
          <ul
            role="list"
            className="divide-y divide-neutral-100 dark:divide-neutral-800"
          >
            {visible.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <AtlasBadge variant={row.kindVariant}>
                      {row.kindLabel}
                    </AtlasBadge>
                    <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">
                      {row.description}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                    {row.detail}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={
                      "text-sm font-semibold " +
                      (row.direction === "credit"
                        ? "text-success-700 dark:text-success-300"
                        : "text-neutral-950 dark:text-white")
                    }
                  >
                    {row.direction === "credit" ? "+" : "\u2212"}
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
                  {row.status && row.statusVariant && (
                    <div className="mt-1">
                      <AtlasBadge variant={row.statusVariant}>
                        {row.status}
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