/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Button } from "@/components/admin/ui/button";
import { formatPeriodLabel } from "@/lib/domains/treasury/period-labels";
import type {
  CloseReadiness,
  TreasuryPeriodId,
} from "@/lib/domains/treasury/period-types";

interface Props {
  open: boolean;
  periodId: TreasuryPeriodId;
  readiness: CloseReadiness | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
}

export function TreasuryClosePeriodModal({
  open,
  periodId,
  readiness,
  submitting,
  onClose,
  onConfirm,
}: Props) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) setNotes("");
  }, [open]);

  if (!open) return null;

  const ready = readiness?.ready ?? false;
  const blockers = readiness?.blockers ?? [];

  return (
    <ModalShell open={open} onClose={onClose} title="Close period">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            You are about to close{" "}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {formatPeriodLabel(periodId)}
            </span>
            .
          </p>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Closing is irreversible. Once closed, no new treasury event can
            target this period, and no event in this period can be reconciled.
            Corrections are contra entries in the current open period.
          </p>
        </div>

        {!ready && blockers.length > 0 && (
          <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs text-warning-900 dark:border-warning-800/60 dark:bg-warning-900/20 dark:text-warning-100">
            <p className="font-medium">This period cannot be closed yet.</p>
            <ul role="list" className="mt-1 list-disc pl-4">
              {blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="mt-2">
              Resolve these before closing the period.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="period-close-notes"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            Notes (optional)
          </label>
          <textarea
            id="period-close-notes"
            aria-label="Period close notes"
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!ready || submitting}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            placeholder="Anything worth recording about this period."
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onConfirm(notes.trim())}
            disabled={!ready || submitting}
            aria-label={
              ready
                ? "Confirm close of " + formatPeriodLabel(periodId)
                : "Cannot close, blockers present"
            }
          >
            {submitting ? "Closing…" : "Close period"}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}