"use client";

import { useEffect, useId, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { formatCurrency } from "@/lib/admin/formatters";
import type { Refund } from "@/lib/admin/types/refund";

interface OrderRefundApproveModalProps {
  refund: Refund | null;
  onClose: () => void;
  onConfirm: (refundId: string, note?: string) => void;
}

export function OrderRefundApproveModal({
  refund,
  onClose,
  onConfirm,
}: OrderRefundApproveModalProps) {
  const noteId = useId();
  const [note, setNote] = useState("");

  useEffect(() => {
    if (refund) setNote("");
  }, [refund]);

  if (!refund) return null;

  return (
    <ModalShell
      open={refund !== null}
      onClose={onClose}
      title="Approve refund"
      description="Approval moves the refund to the processing queue. Payout fires on the next step."
      size="sm"
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
            <span className="text-neutral-500">Customer</span>
            <span>{refund.customer.name}</span>
          </div>
        </div>

        <SettingsField
          label="Approval note"
          hint="Optional. Recorded on the timeline."
          htmlFor={noteId}
        >
          <textarea
            id={noteId}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Anything to note?"
          />
        </SettingsField>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConfirm(refund.id, note.trim() || undefined)}
          >
            Approve refund
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}