/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/orders/order-cancel-modal.tsx
"use client";

import { useEffect, useId, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { SettingsField } from "@/components/admin/ui/settings-field";
import type { Order } from "@/lib/admin/types/orders";
import { formatCurrency } from "@/lib/admin/formatters";

interface OrderCancelModalProps {
  order: Order | null;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => void;
}

export function OrderCancelModal({
  order,
  onClose,
  onConfirm,
}: OrderCancelModalProps) {
  const reasonId = useId();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setReason("");
      setError(null);
    }
  }, [order]);

  if (!order) return null;

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("A reason is required.");
      return;
    }
    onConfirm(order.id, trimmed);
  };

  const description = order.walletDebit
    ? "This releases the wallet hold of " +
      formatCurrency(order.walletDebit.amount) +
      " and cannot be undone."
    : "This cancels the order and cannot be undone.";

  return (
    <ModalShell
      open={order !== null}
      onClose={onClose}
      title="Cancel order"
      description={description}
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
          <div className="flex justify-between">
            <span className="text-neutral-500">Order</span>
            <span className="font-mono text-xs font-medium">{order.id}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Amount</span>
            <span>{formatCurrency(order.amount)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Customer</span>
            <span>{order.customer.name}</span>
          </div>
        </div>

        <SettingsField
          label="Reason for cancellation"
          hint="Recorded on the order timeline and in the audit trail."
          error={error ?? undefined}
          htmlFor={reasonId}
        >
          <textarea
            id={reasonId}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            rows={3}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Why is this order being cancelled?"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? reasonId + "-error" : undefined}
          />
        </SettingsField>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Keep order
          </Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm}>
            Cancel order
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}