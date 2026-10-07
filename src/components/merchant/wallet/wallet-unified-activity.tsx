"use client";

import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { Button } from "@/components/atlas/button";
import { WalletActivityRow } from "./wallet-activity-row";
import type { MerchantLedgerRow } from "@/lib/merchant/types/wallet";

interface Props {
  rows: MerchantLedgerRow[];
  nowMs: number | null;
  viewAllHref: string;
  onFund: () => void;
  emptyHeading?: string;
  emptyBody?: string;
}

const MAX_VISIBLE = 20;

export function WalletUnifiedActivity({
  rows,
  nowMs,
  viewAllHref,
  onFund,
  emptyHeading = "Nothing yet",
  emptyBody = "Your funding, payments, and payouts will show up here.",
}: Props) {
  const visible = rows.slice(0, MAX_VISIBLE);

  return (
    <section aria-labelledby="wallet-activity-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="wallet-activity-heading"
          className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
        >
          Activity
        </h2>
        {rows.length > 0 && (
          <Link
            href={viewAllHref}
            className="text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300"
          >
            View all
          </Link>
        )}
      </div>

      <AtlasCard padding="none" className="overflow-hidden">
        {visible.length === 0 ? (
          <AtlasEmptyState
            title={emptyHeading}
            description={emptyBody}
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
              <li key={row.id}>
                <WalletActivityRow row={row} nowMs={nowMs} />
              </li>
            ))}
          </ul>
        )}
      </AtlasCard>
    </section>
  );
}