/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import {
  NEW_TICKET_DESCRIPTION,
  NEW_TICKET_TITLE,
} from "@/lib/merchant/support/labels";
import {
  TICKET_BODY_MAX_LENGTH,
  TICKET_CATEGORIES,
  TICKET_SUBJECT_MAX_LENGTH,
} from "@/lib/merchant/support/constants";
import { TICKET_CATEGORY_LABELS } from "@/lib/merchant/support/labels";
import type { MerchantTicketCategory } from "@/lib/merchant/support/types";

interface TicketCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    subject: string;
    category: MerchantTicketCategory | "";
    body: string;
  }) => { ok: boolean; error?: string };
}

export function TicketCreateModal({
  open,
  onClose,
  onSubmit,
}: TicketCreateModalProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<MerchantTicketCategory | "">("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSubject("");
      setCategory("");
      setBody("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    const result = onSubmit({ subject, category, body });
    if (!result.ok) {
      setError(result.error ?? "Could not send the request.");
      return;
    }
    onClose();
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title={NEW_TICKET_TITLE}
      description={NEW_TICKET_DESCRIPTION}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="ticket-subject"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Subject
          </label>
          <input
            id="ticket-subject"
            type="text"
            value={subject}
            maxLength={TICKET_SUBJECT_MAX_LENGTH}
            onChange={(e) => {
              setSubject(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Brief summary of the issue"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>

        <div>
          <label
            htmlFor="ticket-category"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Category
          </label>
          <select
            id="ticket-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as MerchantTicketCategory | "");
              if (error) setError(null);
            }}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          >
            <option value="">Select a category</option>
            {TICKET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {TICKET_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="ticket-body"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Message
          </label>
          <textarea
            id="ticket-body"
            value={body}
            maxLength={TICKET_BODY_MAX_LENGTH}
            onChange={(e) => {
              setBody(e.target.value);
              if (error) setError(null);
            }}
            rows={5}
            placeholder="Describe the issue in detail"
            className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <p className="mt-1 text-right text-xs text-neutral-500 dark:text-neutral-400">
            {body.length} / {TICKET_BODY_MAX_LENGTH}
          </p>
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
            Send request
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}