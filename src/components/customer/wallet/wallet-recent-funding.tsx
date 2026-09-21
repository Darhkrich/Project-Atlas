"use client";

import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { Button } from "@/components/atlas/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import type { FundingRow } from "@/lib/customer/wallet/wallet-projection";

interface Props {
  rows: FundingRow[];
  nowMs: number | null;
  onFund: () => void;
}

function iconForMethod(methodId: string): AtlasIconName {
if (methodId === "card") return "card";
  if (methodId === "bank") return "bank";
  if (methodId === "momo") return "mobile";
  return "star";
}

export function WalletRecentFunding({ rows, nowMs, onFund }: Props) {
  return (
    <section aria-labelledby="recent-funding-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="recent-funding-heading"
          className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Recent funding
        </h2>
        <Link
          href="/customer/transactions"
          className="text-sm font-medium text-brand-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
        >
          View all
        </Link>
      </div>

      <AtlasCard padding="none">
        {rows.length === 0 ? (
          <AtlasEmptyState
            title="No funding history"
            description="Your wallet funding activity will appear here."
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
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <AtlasIcon
                      name={iconForMethod(row.method)}
                      className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {row.provider} {row.maskedLabel}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {nowMs ? formatRelative(row.createdAt, nowMs) : "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(row.amount)}
                  </p>
                  <AtlasBadge variant={row.statusVariant}>
                    {row.statusLabel}
                  </AtlasBadge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AtlasCard>
    </section>
  );
}