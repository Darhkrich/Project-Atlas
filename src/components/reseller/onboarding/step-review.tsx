"use client";

import { TEMPLATE_OPTIONS } from "@/lib/reseller/onboarding/templates";
import type { OnboardingDraft } from "@/lib/reseller/onboarding/types";

interface StepReviewProps {
  draft: OnboardingDraft;
  publishError: string | null;
}

export function StepReview({ draft, publishError }: StepReviewProps) {
  const template =
    TEMPLATE_OPTIONS.find((t) => t.id === draft.templateId) ??
    TEMPLATE_OPTIONS[0];
  const storeName = draft.storeName.trim() || "Your shop";

  return (
    <div className="space-y-5">
      {publishError ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300"
        >
          {publishError}
        </div>
      ) : null}

      <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
        <ReviewRow label="Store name" value={storeName} />
        <ReviewRow
          label="Store link"
          value={"atlas.store/" + (draft.slug || "-")}
        />
        <ReviewRow label="Template" value={template.label} />
        {draft.email ? (
          <ReviewRow label="Contact email" value={draft.email} />
        ) : null}
        {draft.phone ? (
          <ReviewRow label="Contact phone" value={draft.phone} />
        ) : null}
      </dl>

      <div className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600 dark:bg-neutral-800/50 dark:text-neutral-400">
        When you open the doors, your storefront goes live and customers can
        buy from you right away.
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {value}
      </dd>
    </div>
  );
}