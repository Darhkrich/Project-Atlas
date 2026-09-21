"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import type { StorefrontLedgerRow } from "@/lib/storefront-user/types/wallet";

interface Props {
  rows: StorefrontLedgerRow[];
  nowMs: number | null;
}

export function WalletRecentActivity({ rows, nowMs }: Props) {
  return (
    <section aria-labelledby="storefront-activity-heading">
      <h2
        id="storefront-activity-heading"
        className="mb-4 text-lg font-semibold text-neutral-900"
      >
        Recent activity
      </h2>
      <AtlasCard padding="none">
        {rows.length === 0 ? (
          <AtlasEmptyState
            title="No activity yet"
            description="Wallet funding and purchases will appear here."
          />
        ) : (
          <ul role="list" className="divide-y divide-neutral-100">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-start justify-between gap-3 px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <AtlasBadge variant={row.kindVariant}>
                      {row.kindLabel}
                    </AtlasBadge>
                    <p className="truncate text-sm font-semibold text-neutral-900">
                      {row.description}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-xs text-neutral-500">
                    {row.detail}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={
                      "text-sm font-semibold " +
                      (row.direction === "credit"
                        ? "text-success-700"
                        : "text-neutral-900")
                    }
                  >
                    {row.direction === "credit" ? "+" : "\u2212"}
                    {formatCurrency(row.total ?? row.amount)}
                  </p>
                  {row.fee !== undefined && row.fee > 0 && (
                    <p className="text-xs text-neutral-500">
                      incl. {formatCurrency(row.fee)} fee
                    </p>
                  )}
                  <p className="mt-1 text-xs text-neutral-500">
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