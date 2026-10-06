/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { cn } from "@/lib/utils";
import { CANCEL_REASON_LABELS } from "@/lib/merchant/orders/labels";
import type { OrderCancelReason } from "@/lib/merchant/orders/types";
import { ORDER_CANCEL_NOTE_MAX_LENGTH } from "@/lib/merchant/orders/constants";

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    reason: OrderCancelReason;
    note?: string;
    restock: boolean;
  }) => { ok: boolean; error?: string };
}

const REASON_OPTIONS: OrderCancelReason[] = [
  "customer_request",
  "out_of_stock",
  "unable_to_fulfill",
  "other",
];

export function CancelModal({ open, onClose, onSubmit }: CancelModalProps) {
  const [reason, setReason] = useState<OrderCancelReason>("customer_request");
  const [note, setNote] = useState("");
  const [restock, setRestock] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason("customer_request");
      setNote("");
      setRestock(true);
      setError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    const trimmed = note.trim();
    const result = onSubmit({
      reason,
      note: trimmed.length > 0 ? trimmed : undefined,
      restock,
    });
    if (!result.ok) {
      setError(result.error ?? "Could not cancel this order.");
      return;
    }
    setError(null);
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Cancel order"
      description="The customer will see the order as cancelled."
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="cancel-reason"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Reason
          </label>
          <select
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as OrderCancelReason)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            {REASON_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {CANCEL_REASON_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="cancel-note"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Note (optional)
          </label>
          <textarea
            id="cancel-note"
            value={note}
            maxLength={ORDER_CANCEL_NOTE_MAX_LENGTH}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Anything else to record?"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <input
            type="checkbox"
            checked={restock}
            onChange={(e) => setRestock(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600"
          />
          <span>
            <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Restock these items
            </span>
            <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
              Restocks the products when this order is cancelled.
            </span>
          </span>
        </label>

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
            Keep order
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold text-white",
              "bg-danger-600 hover:bg-danger-700"
            )}
          >
            Cancel order
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}