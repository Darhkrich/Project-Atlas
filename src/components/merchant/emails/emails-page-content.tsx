/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useMemo, useState } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useEmailTemplates } from "@/lib/merchant/emails/use-email-templates";
import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_KEYS,
  EMAIL_TEMPLATE_LABELS,
} from "@/lib/merchant/emails/constants";
import type { EmailTemplate, EmailTemplateKey } from "@/lib/merchant/emails/types";
import { EmailTemplateRow } from "./email-template-row";
import { EmailTemplateEditModal } from "./email-template-edit-modal";

function templateIsDefault(
  key: EmailTemplateKey,
  template: EmailTemplate
): boolean {
  const d = DEFAULT_EMAIL_TEMPLATES[key];
  return (
    template.subject === d.subject &&
    template.bodyPrefix === d.bodyPrefix &&
    template.bodySuffix === d.bodySuffix &&
    template.replyTo === d.replyTo
  );
}

export function EmailsPageContent() {
  const { storefrontConfig } = useStorefrontConfig();
  const storefrontId = storefrontConfig.storefrontId;
  const { templates, update, reset } = useEmailTemplates(storefrontId);

  const [editingKey, setEditingKey] = useState<EmailTemplateKey | null>(null);

  const defaultCount = useMemo(
    () =>
      EMAIL_TEMPLATE_KEYS.filter((k) =>
        templateIsDefault(k, templates[k])
      ).length,
    [templates]
  );

  const customizedCount = EMAIL_TEMPLATE_KEYS.length - defaultCount;

  function handleSave(patch: Partial<EmailTemplate>) {
    if (!editingKey) return;
    update(editingKey, patch);
    setEditingKey(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          Emails
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Templates for the emails your customers receive. {customizedCount}{" "}
          of {EMAIL_TEMPLATE_KEYS.length} customized.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <span
          className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-600"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          Your changes are saved. Email delivery is handled by Atlas and is
          not yet enabled for this store.
        </p>
      </div>

      <ul role="list" className="space-y-3">
        {EMAIL_TEMPLATE_KEYS.map((key) => (
          <EmailTemplateRow
            key={key}
            templateKey={key}
            template={templates[key]}
            isDefault={templateIsDefault(key, templates[key])}
            onEdit={() => setEditingKey(key)}
            onReset={() => reset(key)}
          />
        ))}
      </ul>

      <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-500">
        {customizedCount > 0
          ? customizedCount +
            (customizedCount === 1
              ? " template customized."
              : " templates customized.")
          : "All templates are using Atlas defaults."}
      </p>

      <EmailTemplateEditModal
        open={editingKey !== null}
        onClose={() => setEditingKey(null)}
        templateKey={editingKey}
        template={editingKey ? templates[editingKey] : null}
        onSave={handleSave}
      />
    </div>
  );
}