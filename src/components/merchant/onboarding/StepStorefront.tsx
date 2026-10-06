"use client";

import { TemplateGrid } from "./TemplateGrid";
import { BrandingBlock } from "./BrandingBlock";
import { StepHeader } from "./StepHeader";
import type {
  MerchantOnboardingBranding,
  MerchantOnboardingDraft,
} from "@/lib/merchant/onboarding/types";

interface StepStorefrontProps {
  draft: MerchantOnboardingDraft;
  errors: string[];
  onBrandingChange: (key: keyof MerchantOnboardingBranding, value: string) => void;
  onTemplateChange: (id: string) => void;
}

export default function StepStorefront({
  draft,
  errors,
  onBrandingChange,
  onTemplateChange,
}: StepStorefrontProps) {
  return (
    <div className="space-y-7">
      <StepHeader
        title="Design your storefront"
        description="Pick a template and shape how your store looks. Everything here appears on the live site."
      />

      {errors.length > 0 && (
        <ul
          role="alert"
          className="space-y-1 rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300"
        >
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Template
        </h2>
        <TemplateGrid value={draft.templateId} onChange={onTemplateChange} />
      </section>

      <section className="space-y-3 border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Brand
        </h2>
        <BrandingBlock value={draft.branding} onChange={onBrandingChange} />
      </section>
    </div>
  );
}