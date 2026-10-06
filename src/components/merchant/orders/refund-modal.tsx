/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import {
  MERCHANT_REFUND_REASON_LABELS,
  remainingRefundable,
  type MerchantRefundReason,
} from "@/lib/merchant/orders/refund";
import { ORDER_REFUND_NOTE_MAX_LENGTH } from "@/lib/merchant/orders/constants";
import { getWalletConfig } from "@/lib/domains/wallet/config-store";
import type { CustomerOrder } from "@/contexts/orders-context";

interface RefundModalProps {
  open: boolean;
  onClose: () => void;
  order: CustomerOrder;
  onSubmit: (input: {
    amount: number;
    reason: MerchantRefundReason;
    reasonNote?: string;
  }) => { ok: boolean; error?: string; requiresApproval?: boolean };
}

const REASON_OPTIONS: MerchantRefundReason[] = [
  "customer_request",
  "product_not_as_described",
  "damaged_on_arrival",
  "wrong_item",
  "duplicate_order",
  "other",
];

export function RefundModal({
  open,
  onClose,
  order,
  onSubmit,
}: RefundModalProps) {
  const remaining = useMemo(() => remainingRefundable(order), [order]);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState<MerchantRefundReason>("customer_request");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [approvalNotice, setApprovalNotice] = useState(false);

  const threshold = getWalletConfig().refundAutoApproveThreshold;

  useEffect(() => {
    if (!open) return;
    setAmount(remaining > 0 ? remaining.toFixed(2) : "");
    setReason("customer_request");
    setNote("");
    setError(null);
    setApprovalNotice(false);
  }, [open, remaining]);

  const parsedAmount = Number.parseFloat(amount);
  const aboveThreshold =
    Number.isFinite(parsedAmount) && parsedAmount > threshold;

  const handleSubmit = () => {
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a refund amount greater than zero.");
      return;
    }
    const trimmed = note.trim();
    const result = onSubmit({
      amount: parsedAmount,
      reason,
      reasonNote: trimmed.length > 0 ? trimmed : undefined,
    });
    if (!result.ok) {
      setError(result.error ?? "Refund could not be processed.");
      if (result.requiresApproval) setApprovalNotice(true);
      return;
    }
    setError(null);
    setApprovalNotice(false);
  };

  const labelAmount = Number.isFinite(parsedAmount)
    ? parsedAmount.toFixed(2)
    : "0.00";

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Refund order"
      description={"Refund up to GH\u20B5 " + remaining.toFixed(2) + "."}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="refund-amount"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            {"Amount (GH\u20B5) "}
            <span className="text-danger-500">*</span>
          </label>
          <input
            id="refund-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (error) setError(null);
              if (approvalNotice) setApprovalNotice(false);
            }}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            The customer is refunded to the original payment method.
          </p>
        </div>

        <div>
          <label
            htmlFor="refund-reason"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Reason
          </label>
          <select
            id="refund-reason"
            value={reason}
            onChange={(e) =>
              setReason(e.target.value as MerchantRefundReason)
            }
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            {REASON_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {MERCHANT_REFUND_REASON_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="refund-note"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Note (optional)
          </label>
          <textarea
            id="refund-note"
            value={note}
            maxLength={ORDER_REFUND_NOTE_MAX_LENGTH}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Anything else to record?"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>

        <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-950 dark:text-neutral-400">
          {"Refunding GH\u20B5 "}
          {labelAmount}
          {" from your main wallet."}
          {aboveThreshold && (
            <span className="mt-1 block text-warning-700 dark:text-warning-400">
              {"Refunds above GH\u20B5 "}
              {threshold.toFixed(2)}
              {" need admin review."}
            </span>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {aboveThreshold ? "Request refund" : "Confirm refund"}
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}