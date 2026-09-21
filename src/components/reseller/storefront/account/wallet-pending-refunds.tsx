"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import type { StorefrontPendingRefundRow } from "@/lib/storefront-user/types/wallet";

interface Props {
  rows: StorefrontPendingRefundRow[];
  nowMs: number | null;
  onCancel: (requestId: string) => void;
  cancelling: boolean;
}

export function WalletPendingRefunds({
  rows,
  nowMs,
  onCancel,
  cancelling,
}: Props) {
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="storefront-pending-refunds-heading">
      <h2
        id="storefront-pending-refunds-heading"
        className="mb-4 text-lg font-semibold text-neutral-900"
      >
        Refunds in progress
      </h2>
      <ul role="list" className="space-y-3">
        {rows.map((row) => (
          <li key={row.id}>
            <AtlasCard
              className={
                row.status === "pending_admin"
                  ? "border-warning-200 bg-warning-50/40"
                  : undefined
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900">
                    To {row.sourceDescription}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Requested{" "}
                    {nowMs ? formatRelative(row.requestedAt, nowMs) : "recently"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">
                    {formatCurrency(row.total)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    incl. {formatCurrency(row.fee)} fee
                  </p>
                  <div className="mt-1">
                    <AtlasBadge variant={row.statusVariant}>
                      {row.statusLabel}
                    </AtlasBadge>
                  </div>
                </div>
              </div>

              {row.canCancel && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onCancel(row.id)}
                    disabled={cancelling}
                    className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-danger-400 hover:text-danger-700 disabled:opacity-50"
                  >
                    Cancel refund
                  </button>
                </div>
              )}
            </AtlasCard>
          </li>
        ))}
      </ul>
    </section>
  );
}