/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import type { AuditActor } from "@/lib/domains/audit";
import {
  REPORT_ALREADY_ACTIVE,
  REPORT_MODAL_BODY,
  REPORT_MODAL_TITLE,
  REPORT_NOTE_REQUIRED_FOR_OTHER,
  REPORT_REASON_LABELS,
} from "@/lib/merchant/customers/labels";
import { CUSTOMER_REPORT_NOTE_MAX_LENGTH } from "@/lib/merchant/customers/constants";
import { createCustomerReport } from "@/lib/merchant/customers/report-mutations";
import type {
  CustomerReportReason,
  MerchantCustomerView,
} from "@/lib/merchant/customers/types";

interface CustomerReportModalProps {
  open: boolean;
  onClose: () => void;
  storeSlug: string;
  customer: MerchantCustomerView | null;
  actor: AuditActor;
  onSubmitted: () => void;
}

const REASON_OPTIONS: CustomerReportReason[] = [
  "fraud",
  "abuse",
  "chargebacks",
  "repeated_refunds",
  "harassment",
  "other",
];

export function CustomerReportModal({
  open,
  onClose,
  storeSlug,
  customer,
  actor,
  onSubmitted,
}: CustomerReportModalProps) {
  const [reason, setReason] = useState<CustomerReportReason>("fraud");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setReason("fraud");
      setNote("");
      setError(null);
    }
  }, [open]);

  const alreadyReported = customer?.hasActiveReport === true;

  const handleSubmit = () => {
    if (!customer) return;

    if (alreadyReported) {
      setError(REPORT_ALREADY_ACTIVE);
      return;
    }

    const trimmed = note.trim();
    const result = createCustomerReport(
      {
        storeSlug,
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: customer.name,
        reason,
        note: trimmed.length > 0 ? trimmed : undefined,
      },
      actor
    );

    if (!result.ok) {
      setError(result.error ?? "Could not submit the report.");
      return;
    }

    setError(null);
    onSubmitted();
    onClose();
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title={REPORT_MODAL_TITLE}
      description={customer ? customer.name : ""}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {REPORT_MODAL_BODY}
        </p>

        <div>
          <label
            htmlFor="report-reason"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Reason
          </label>
          <select
            id="report-reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value as CustomerReportReason);
              if (error) setError(null);
            }}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            {REASON_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {REPORT_REASON_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="report-note"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Note
            {reason === "other" && (
              <span className="text-danger-500"> *</span>
            )}
          </label>
          <textarea
            id="report-note"
            value={note}
            maxLength={CUSTOMER_REPORT_NOTE_MAX_LENGTH}
            onChange={(e) => {
              setNote(e.target.value);
              if (error) setError(null);
            }}
            rows={4}
            placeholder="Anything specific Atlas should know?"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {note.length} / {CUSTOMER_REPORT_NOTE_MAX_LENGTH}
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-200">
            {error}
          </p>
        )}

        {reason === "other" && !error && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {REPORT_NOTE_REQUIRED_FOR_OTHER}
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
            disabled={alreadyReported}
            className="rounded-lg bg-danger-600 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit report
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}