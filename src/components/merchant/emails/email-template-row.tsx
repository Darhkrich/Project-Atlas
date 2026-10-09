"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import {
  EMAIL_TEMPLATE_LABELS,
  EMAIL_TEMPLATE_TRIGGERS,
} from "@/lib/merchant/emails/constants";
import type { EmailTemplate, EmailTemplateKey } from "@/lib/merchant/emails/types";

interface EmailTemplateRowProps {
  templateKey: EmailTemplateKey;
  template: EmailTemplate;
  isDefault: boolean;
  onEdit: () => void;
  onReset: () => void;
}

export function EmailTemplateRow({
  templateKey,
  template,
  isDefault,
  onEdit,
  onReset,
}: EmailTemplateRowProps) {
  const label = EMAIL_TEMPLATE_LABELS[templateKey];
  const trigger = EMAIL_TEMPLATE_TRIGGERS[templateKey];

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {label}
          </span>
          {isDefault && (
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              Default
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          {trigger}
        </p>
        <p className="mt-2 truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">
          <span className="text-neutral-500 dark:text-neutral-400">
            Subject:{" "}
          </span>
          {template.subject || "\u2014"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="edit" className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={isDefault}
          aria-label={"Reset " + label + " to default"}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <AtlasIcon
            name="refresh"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </button>
      </div>
    </li>
  );
}