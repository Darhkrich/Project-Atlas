"use client";

import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import type { Refund } from "@/lib/admin/types/refund";

interface OrderRefundProcessModalProps {
  refund: Refund | null;
  treasuryBalance: number;
  onClose: () => void;
  onConfirm: (refundId: string) => void;
}

export function OrderRefundProcessModal({
  refund,
  treasuryBalance,
  onClose,
  onConfirm,
}: OrderRefundProcessModalProps) {
  if (!refund) return null;

  const walletFunded = refund.order.paymentMethodId === "wallet";
  const destination = walletFunded ? "Wallet credit" : "Original payment rail";
  const treasuryAfter = Math.round((treasuryBalance - refund.amount) * 100) / 100;
  const insufficient = treasuryBalance < refund.amount;

  return (
    <ModalShell
      open={refund !== null}
      onClose={onClose}
      title="Process refund"
      description="Payout fires immediately and debits the Atlas treasury."
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
          <div className="flex justify-between">
            <span className="text-neutral-500">Refund</span>
            <span className="font-mono text-xs font-medium">{refund.id}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Amount</span>
            <span className="font-semibold">{formatCurrency(refund.amount)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Destination</span>
            <span>{destination}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Customer</span>
            <span>{refund.customer.name}</span>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Coverage split
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-neutral-500">Atlas share</p>
              <p className="font-semibold">
                {formatCurrency(refund.atlasShareAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Reseller share</p>
              <p className="font-semibold">
                {formatCurrency(refund.resellerShareAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Treasury impact
          </p>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Balance before</span>
              <span>{formatCurrency(treasuryBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Debit</span>
              <span className="text-danger-600">
                -{formatCurrency(refund.amount)}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Balance after</span>
              <span className={insufficient ? "text-danger-600" : undefined}>
                {formatCurrency(treasuryAfter)}
              </span>
            </div>
          </div>
        </div>

        {insufficient && (
          <p className="text-sm text-danger-600" role="alert">
            Treasury balance is below the refund amount. Top up before
            processing.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConfirm(refund.id)}
            disabled={insufficient}
          >
            Process refund
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}