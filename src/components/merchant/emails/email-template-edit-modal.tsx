/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import {
  EMAIL_BODY_MAX,
  EMAIL_REPLY_TO_MAX,
  EMAIL_SUBJECT_MAX,
  EMAIL_TEMPLATE_LABELS,
} from "@/lib/merchant/emails/constants";
import type { EmailTemplate, EmailTemplateKey } from "@/lib/merchant/emails/types";

interface EmailTemplateEditModalProps {
  open: boolean;
  onClose: () => void;
  templateKey: EmailTemplateKey | null;
  template: EmailTemplate | null;
  onSave: (patch: Partial<EmailTemplate>) => void;
}

interface FormState {
  subject: string;
  bodyPrefix: string;
  bodySuffix: string;
  replyTo: string;
}

const EMPTY_FORM: FormState = {
  subject: "",
  bodyPrefix: "",
  bodySuffix: "",
  replyTo: "",
};

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100";

export function EmailTemplateEditModal({
  open,
  onClose,
  templateKey,
  template,
  onSave,
}: EmailTemplateEditModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!open || !template) return;
    setForm({
      subject: template.subject,
      bodyPrefix: template.bodyPrefix,
      bodySuffix: template.bodySuffix,
      replyTo: template.replyTo,
    });
  }, [open, template]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    onSave({
      subject: form.subject.trim().slice(0, EMAIL_SUBJECT_MAX),
      bodyPrefix: form.bodyPrefix.trim().slice(0, EMAIL_BODY_MAX),
      bodySuffix: form.bodySuffix.trim().slice(0, EMAIL_BODY_MAX),
      replyTo: form.replyTo.trim().slice(0, EMAIL_REPLY_TO_MAX),
    });
  }

  const label = templateKey ? EMAIL_TEMPLATE_LABELS[templateKey] : "Email";

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title={label}
      description="Edit the parts of this email your customers see."
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email-subject"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Subject line
          </label>
          <input
            id="email-subject"
            type="text"
            value={form.subject}
            onChange={(e) => setField("subject", e.target.value)}
            maxLength={EMAIL_SUBJECT_MAX}
            placeholder="e.g. Your order is confirmed"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="email-prefix"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Opening paragraph
          </label>
          <textarea
            id="email-prefix"
            value={form.bodyPrefix}
            onChange={(e) => setField("bodyPrefix", e.target.value)}
            rows={3}
            maxLength={EMAIL_BODY_MAX}
            placeholder="One or two sentences at the top."
            className={inputClass + " resize-none"}
          />
        </div>

        <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
            Order details, tracking numbers, and links are inserted here by
            Atlas.
          </p>
        </div>

        <div>
          <label
            htmlFor="email-suffix"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Closing paragraph
          </label>
          <textarea
            id="email-suffix"
            value={form.bodySuffix}
            onChange={(e) => setField("bodySuffix", e.target.value)}
            rows={3}
            maxLength={EMAIL_BODY_MAX}
            placeholder="A short sign-off, contact line, or note."
            className={inputClass + " resize-none"}
          />
        </div>

        <div>
          <label
            htmlFor="email-reply-to"
            className="mb-1.5 block text-xs font-medium text-neutral-700 dark:text-neutral-300"
          >
            Reply-to address (optional)
          </label>
          <input
            id="email-reply-to"
            type="email"
            value={form.replyTo}
            onChange={(e) => setField("replyTo", e.target.value)}
            maxLength={EMAIL_REPLY_TO_MAX}
            placeholder="Leave blank to use your contact email"
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Save template
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}