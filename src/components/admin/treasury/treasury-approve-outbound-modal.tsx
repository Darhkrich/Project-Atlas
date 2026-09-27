"use client";

import { useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import type { TreasuryEvent } from "@/lib/domains/treasury/types";
import { TREASURY_KIND_LABELS } from "@/lib/domains/treasury/labels";

interface TreasuryApproveOutboundModalProps {
  event: TreasuryEvent | null;
  onClose: () => void;
  onConfirm: (eventId: string) => void;
}

export function TreasuryApproveOutboundModal({
  event,
  onClose,
  onConfirm,
}: TreasuryApproveOutboundModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!event) return null;

  const handleConfirm = () => {
    setError(null);
    onConfirm(event.id);
  };

  return (
    <ModalShell
      open={event !== null}
      onClose={onClose}
      title="Approve outbound"
      description="You are acting as the second admin on this outbound."
      size="sm"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
          <div className="flex justify-between">
            <span className="text-neutral-500">Event</span>
            <span className="font-mono text-xs">{event.id}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Kind</span>
            <span>{TREASURY_KIND_LABELS[event.kind]}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Amount</span>
            <span className="font-semibold">{formatCurrency(event.amount)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-neutral-500">Created by</span>
            <span>{event.createdBy.name}</span>
          </div>
          {event.counterparty && (
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500">Counterparty</span>
              <span>{event.counterparty.name}</span>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-info-200 bg-info-50 p-3 text-xs text-info-800 dark:border-info-800 dark:bg-info-900/20 dark:text-info-200">
          Approval moves this outbound to the settlement queue. It is not yet
          paid until the settlement action fires.
        </div>

        {error && (
          <p className="text-sm text-danger-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirm}>
            Approve outbound
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}