"use client";

import { Button } from "@/components/atlas/button";
import { StepHeader } from "./StepHeader";
import { storefrontUrl } from "@/lib/merchant/onboarding/slug";
import { getCategoryLabel } from "@/lib/merchant/onboarding/categories";
import { templateLabel } from "@/lib/merchant/onboarding/templates";
import { getOnboardingPlanByCode } from "@/lib/merchant/onboarding/plans";
import type { MerchantOnboardingDraft } from "@/lib/merchant/onboarding/types";

interface StepPublishProps {
  draft: MerchantOnboardingDraft;
  publishing: boolean;
  error: string | null;
  onPublish: () => void;
}

export default function StepPublish({
  draft,
  publishing,
  error,
  onPublish,
}: StepPublishProps) {
  const plan = getOnboardingPlanByCode(draft.planId);
  const url = storefrontUrl(draft.reservedSlug || "your-store");

  const rows: { label: string; value: string }[] = [
    { label: "Business name", value: draft.businessName || "Not set" },
    { label: "Category", value: getCategoryLabel(draft.businessCategory) },
    {
      label: "Template",
      value: draft.templateId
        ? templateLabel(draft.templateId)
        : "Not selected",
    },
    {
      label: "Plan",
      value:
        plan === undefined
          ? "Not selected"
          : plan.name +
            " (" +
            (draft.billingCycle === "annual" ? "Annual" : "Monthly") +
            ")",
    },
    {
      label: "Store URL",
      value: draft.reservedSlug ? url : "Not reserved",
    },
  ];

  return (
    <div className="space-y-7">
      <StepHeader
        title="Review and publish"
        description="Have a look at what your store will be. Publish when ready."
      />

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300"
        >
          {error}
        </div>
      )}

      <dl className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <dt className="text-sm text-neutral-500">{row.label}</dt>
            <dd className="max-w-[60%] break-words text-right text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-900/40 dark:bg-brand-900/20">
        <p className="text-sm text-brand-900 dark:text-brand-200">
          When you publish, your storefront goes live at{" "}
          <span className="font-semibold">{url}</span>. You can edit everything
          afterwards from your dashboard.
        </p>
      </div>

      <Button
        type="button"
        onClick={onPublish}
        disabled={publishing}
        className="w-full"
      >
        {publishing ? "Publishing\u2026" : "Publish store"}
      </Button>
    </div>
  );
}