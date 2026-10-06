/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/support/compensation-dialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";
import type { LinkedEntity } from "@/lib/admin/types/support";
import {
  compensationOptionsFor,
  compensationReasonFor,
  suggestedAmountFor,
  type CompensationMethod,
} from "@/lib/admin/support/entity-actions";
import { MIDDOT, ELLIPSIS } from "@/lib/admin/support/constants";

export interface CompensationPayload {
  method: CompensationMethod;
  amount: number;
  reason: string;
  note?: string;
}

interface CompensationDialogProps {
  open: boolean;
  entity: LinkedEntity | null;
  submitting?: boolean;
  onCancel: () => void;
  onConfirm: (payload: CompensationPayload) => void;
}

export function CompensationDialog({
  open,
  entity,
  submitting = false,
  onCancel,
  onConfirm,
}: CompensationDialogProps) {
  const options = useMemo(
    () => (entity ? compensationOptionsFor(entity) : []),
    [entity]
  );

  const [method, setMethod] = useState<CompensationMethod | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (!open || !entity) return;
    setMethod(options[0]?.method ?? null);
    setAmount(String(suggestedAmountFor(entity)));
    setReason(compensationReasonFor(entity));
    setNote("");
  }, [open, entity, options]);

  if (!open || !entity) return null;

  const amountNumber = Number(amount);
  const amountValid =
    !Number.isNaN(amountNumber) && amountNumber >= 0 && amount.length > 0;
  const canConfirm = Boolean(method) && amountValid && reason.trim().length > 0;

  return (
    <ModalShell
      open={open}
      onClose={onCancel}
      title="Issue compensation"
      description={entitySummary(entity)}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!canConfirm || submitting}
            onClick={() => {
              if (!method) return;
              onConfirm({
                method,
                amount: amountNumber,
                reason: reason.trim(),
                note: note.trim() || undefined,
              });
            }}
          >
            {submitting ? "Issuing" + ELLIPSIS : "Issue compensation"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <fieldset>
          <legend className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Payment method
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {options.map((opt) => {
              const isSelected = method === opt.method;
              return (
                <button
                  key={opt.method}
                  type="button"
                  onClick={() => setMethod(opt.method)}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    isSelected
                      ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/30"
                      : "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {opt.label}
                    </span>
                    {isSelected && <Badge variant="brand">Selected</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {opt.description}
                  </p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Amount (GHS)
            </span>
            <Input
              className="mt-1"
              value={amount}
              inputMode="decimal"
              onChange={(e) => setAmount(e.target.value)}
              aria-invalid={!amountValid}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Reason
            </span>
            <Input
              className="mt-1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Internal note (optional)
          </span>
          <textarea
            className="mt-1 w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Context for other admins, not visible to the customer"
          />
        </label>
      </div>
    </ModalShell>
  );
}

function entitySummary(entity: LinkedEntity): string {
  switch (entity.kind) {
    case "digital_transaction":
      return (
        entity.service +
        " " +
        MIDDOT +
        " " +
        entity.transactionId +
        " " +
        MIDDOT +
        " GHS " +
        entity.amount
      );
    case "reseller_order":
      return (
        entity.orderId +
        " " +
        MIDDOT +
        " " +
        entity.resellerName +
        " " +
        MIDDOT +
        " GHS " +
        entity.commission +
        " commission"
      );
    case "merchant_account":
      return entity.merchantName + " " + MIDDOT + " " + entity.plan + " plan";
    default:
      return entity.label;
  }
}