"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { formatCurrency } from "@/lib/shared/format";
import { formatRelative } from "@/lib/shared/format";
import type {
  MerchantBillingSummary,
  MerchantMainSummary,
  MerchantWalletRecord,
} from "@/lib/merchant/types/wallet";

interface Props {
  walletType: "billing" | "main";
  record: MerchantWalletRecord;
  frozen: boolean;
  billingSummary?: MerchantBillingSummary;
  mainSummary?: MerchantMainSummary;
  nowMs: number | null;
  onFund: () => void;
  onTransfer: () => void;
  onWithdraw: () => void;
  onAutoPay: () => void;
}

export function WalletCard({
  walletType,
  record,
  frozen,
  billingSummary,
  mainSummary,
  nowMs,
  onFund,
  onTransfer,
  onWithdraw,
  onAutoPay,
}: Props) {
  const isBilling = walletType === "billing";
  const title = isBilling ? "Billing wallet" : "Main wallet";
  const subtitle = isBilling
    ? "Funds plan charges and subscription renewals."
    : "Receives customer payments. Source of refunds and withdrawals.";

  return (
    <AtlasCard
      className={
        "flex h-full flex-col " +
        (frozen ? "border-danger-200 dark:border-danger-900/60" : "")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
              {title}
            </h2>
            {frozen && <AtlasBadge variant="danger">Frozen</AtlasBadge>}
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <AtlasIcon
            name={isBilling ? "credit-card" : "wallet"}
            className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Available balance
        </p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
          {formatCurrency(record.balance)}
        </p>
        {record.lastCreditAt && nowMs && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Last credit {formatRelative(record.lastCreditAt, nowMs)}
          </p>
        )}
      </div>

      {isBilling && billingSummary && (
        <div className="mt-5 space-y-2 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Auto-pay
            </span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {billingSummary.autoPayEnabled
                ? billingSummary.autoPaySource === "card"
                  ? "On - card on file"
                  : "On - billing wallet"
                : "Off"}
            </span>
          </div>
          {billingSummary.lastChargeAmount !== null &&
            billingSummary.lastChargeAt !== null && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Last charge
                </span>
                <span className="text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(billingSummary.lastChargeAmount)}
                  {billingSummary.lastChargeStatus === "failed" && (
                    <span className="ml-1 text-danger-600 dark:text-danger-400">
                      (failed)
                    </span>
                  )}
                </span>
              </div>
            )}
          {billingSummary.pastDueCount > 0 && (
            <p className="text-xs text-danger-600 dark:text-danger-400">
              {billingSummary.pastDueCount} charge
              {billingSummary.pastDueCount === 1 ? "" : "s"} past due.
            </p>
          )}
          <button
            type="button"
            onClick={onAutoPay}
            disabled={frozen}
            className="text-xs font-semibold text-brand-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-300"
          >
            Configure auto-pay
          </button>
        </div>
      )}

      {!isBilling && mainSummary && (
        <div className="mt-5 space-y-2 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">
              Customer payments
            </span>
            <span className="text-neutral-900 dark:text-neutral-100">
              {mainSummary.customerPaymentCount}
            </span>
          </div>
          {mainSummary.lastCustomerPaymentAmount !== null &&
            mainSummary.lastCustomerPaymentAt !== null && nowMs && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Last payment
                </span>
                <span className="text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(mainSummary.lastCustomerPaymentAmount)}
                  {" \u00B7 "}
                  {formatRelative(mainSummary.lastCustomerPaymentAt, nowMs)}
                </span>
              </div>
            )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onFund}
          disabled={frozen}
        >
          <AtlasIcon name="plus" className="h-4 w-4" aria-hidden="true" />
          Fund
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onTransfer}
          disabled={frozen}
        >
          Transfer
        </Button>
        {!isBilling && (
          <Button
            variant="outline"
            size="sm"
            onClick={onWithdraw}
            disabled={frozen}
          >
            Withdraw
          </Button>
        )}
      </div>

      {frozen && (
        <p className="mt-3 text-xs text-danger-600 dark:text-danger-400">
          This wallet is frozen. Contact support. Funding is still available so
          you can restore coverage.
        </p>
      )}
    </AtlasCard>
  );
}