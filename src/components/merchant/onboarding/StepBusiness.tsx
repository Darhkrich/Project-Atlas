"use client";

import { CategoryGrid } from "./CategoryGrid";
import { StepHeader } from "./StepHeader";
import {
  deriveSlug,
  storefrontUrl,
  validateSlug,
} from "@/lib/merchant/onboarding/slug";
import type { MerchantOnboardingDraft } from "@/lib/merchant/onboarding/types";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

interface StepBusinessProps {
  draft: MerchantOnboardingDraft;
  errors: string[];
  onChange: <K extends keyof MerchantOnboardingDraft>(
    key: K,
    value: MerchantOnboardingDraft[K]
  ) => void;
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900";

const labelClass =
  "mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300";

export default function StepBusiness({
  draft,
  errors,
  onChange,
}: StepBusinessProps) {
  const handleNameChange = (name: string) => {
    onChange("businessName", name);
    onChange("reservedSlug", deriveSlug(name));
  };

  const handleCategoryChange = (value: MerchantTemplateCategory) => {
    onChange("businessCategory", value);
  };

  const slug = draft.reservedSlug || deriveSlug(draft.businessName);
  const slugCheck = validateSlug(slug);
  const reservedUrl = storefrontUrl(slug);

  return (
    <div className="space-y-7">
      <StepHeader
        title="Tell us about your business"
        description="We use this to filter the templates you can pick from."
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

      <div className="space-y-5">
        <div>
          <label htmlFor="businessName" className={labelClass}>
            Business name
          </label>
          <input
            id="businessName"
            type="text"
            value={draft.businessName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Glow Beauty Cosmetics"
            autoComplete="organization"
            className={inputClass}
          />
        </div>

        {slug && (
          <div
            className={
              "rounded-lg border p-3 " +
              (slugCheck.ok
                ? "border-brand-200 bg-brand-50 dark:border-brand-900/40 dark:bg-brand-900/20"
                : "border-danger-200 bg-danger-50 dark:border-danger-900/40 dark:bg-danger-900/20")
            }
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Your store URL
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-brand-700 dark:text-brand-300">
              {reservedUrl}
            </p>
            {!slugCheck.ok && (
              <p role="alert" className="mt-1 text-xs text-danger-700 dark:text-danger-300">
                {slugCheck.reason === "reserved"
                  ? "That URL is reserved. Try another name."
                  : slugCheck.reason === "too-short"
                  ? "Store name is too short."
                  : "Enter a store name to reserve your URL."}
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="businessDescription" className={labelClass}>
            Business description
          </label>
          <textarea
            id="businessDescription"
            value={draft.businessDescription}
            onChange={(e) => onChange("businessDescription", e.target.value)}
            rows={3}
            placeholder="Briefly describe what you sell"
            className={inputClass + " resize-none"}
          />
        </div>

        <div>
          <span className={labelClass}>What do you sell?</span>
          <CategoryGrid
            value={draft.businessCategory}
            onChange={handleCategoryChange}
          />
        </div>
      </div>
    </div>
  );
}