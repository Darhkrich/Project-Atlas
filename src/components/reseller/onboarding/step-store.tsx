"use client";

import { BrandColorPicker } from "./brand-color-picker";
import { SlugField } from "./slug-field";
import {
  FIELD_LABELS,
} from "@/lib/reseller/onboarding/labels";
import { MAX_STORE_NAME_LENGTH } from "@/lib/reseller/onboarding/constants";
import type { OnboardingDraft } from "@/lib/reseller/onboarding/types";

interface StepStoreProps {
  draft: OnboardingDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<OnboardingDraft>) => void;
}

export function StepStore({ draft, errors, onChange }: StepStoreProps) {
  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor="storeName"
          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
        >
          {FIELD_LABELS.storeName}
        </label>
        <input
          id="storeName"
          name="storeName"
          value={draft.storeName}
          onChange={(e) =>
            onChange({
              storeName: e.target.value.slice(0, MAX_STORE_NAME_LENGTH),
            })
          }
          maxLength={MAX_STORE_NAME_LENGTH}
          autoComplete="organization"
          aria-invalid={Boolean(errors.storeName)}
          aria-describedby={errors.storeName ? "storeName-error" : undefined}
          className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
        />
        {errors.storeName ? (
          <p
            id="storeName-error"
            className="mt-1.5 text-xs text-rose-700 dark:text-rose-400"
          >
            {errors.storeName}
          </p>
        ) : null}
      </div>

      <SlugField
        value={draft.slug}
        onChange={(value) => onChange({ slug: value })}
        error={errors.slug}
      />

      <div>
        <label
          htmlFor="logo"
          className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
        >
          {FIELD_LABELS.logo}
        </label>
        <input
          id="logo"
          name="logo"
          type="url"
          value={draft.logo}
          onChange={(e) => onChange({ logo: e.target.value })}
          placeholder="https://"
          autoComplete="off"
          className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>

      <BrandColorPicker
        primaryColor={draft.primaryColor}
        accentColor={draft.accentColor}
        onChange={(primary, accent) =>
          onChange({ primaryColor: primary, accentColor: accent })
        }
      />
    </div>
  );
}