"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { formatCurrency } from "@/lib/shared/format";
import type {
  StorefrontUserWalletRecord,
  StorefrontUserWalletSummary,
} from "@/lib/storefront-user/types/wallet";

interface Props {
  wallet: StorefrontUserWalletRecord;
  summary: StorefrontUserWalletSummary;
  isFrozen: boolean;
  onFund: () => void;
  onRefund: () => void;
}

export function WalletCard({
  wallet,
  summary,
  isFrozen,
  onFund,
  onRefund,
}: Props) {
  return (
    <AtlasCard>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-neutral-500">Wallet balance</p>
          <p className="mt-1 text-3xl font-bold text-neutral-900">
            {formatCurrency(wallet.balance)}
          </p>
          {isFrozen && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-danger-50 px-3 py-1 text-xs font-medium text-danger-700">
              <AtlasIcon name="alert" className="h-3.5 w-3.5" />
              Wallet frozen
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-600">
            <div>
              <span className="block text-neutral-500">Lifetime in</span>
              <span className="font-semibold text-neutral-900">
                {formatCurrency(summary.totalFunded)}
              </span>
            </div>
            <div>
              <span className="block text-neutral-500">Lifetime spent</span>
              <span className="font-semibold text-neutral-900">
                {formatCurrency(summary.totalSpent)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 sm:flex-col">
          <Button onClick={onFund} disabled={isFrozen}>
            <AtlasIcon name="plus" className="h-4 w-4" />
            Fund wallet
          </Button>
          <Button
            variant="outline"
            onClick={onRefund}
            disabled={isFrozen || wallet.balance <= 0}
          >
            Refund to source
          </Button>
        </div>
      </div>
    </AtlasCard>
  );
}