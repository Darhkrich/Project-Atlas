"use client";

import { LogoUpload } from "./LogoUpload";
import type { MerchantOnboardingBranding } from "@/lib/merchant/onboarding/types";

interface BrandingBlockProps {
  value: MerchantOnboardingBranding;
  onChange: (key: keyof MerchantOnboardingBranding, value: string) => void;
}

export function BrandingBlock({ value, onChange }: BrandingBlockProps) {
  return (
    <div className="space-y-5">
      <LogoUpload value={value.logo} onChange={(v) => onChange("logo", v)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Primary color
          </span>
          <div className="mt-1.5 flex gap-2">
            <input
              type="color"
              value={value.primaryColor}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              aria-label="Primary color picker"
              className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
            />
            <input
              value={value.primaryColor}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              aria-label="Primary color hex value"
              className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm uppercase text-neutral-900 outline-none focus:border-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Accent color
          </span>
          <div className="mt-1.5 flex gap-2">
            <input
              type="color"
              value={value.accentColor}
              onChange={(e) => onChange("accentColor", e.target.value)}
              aria-label="Accent color picker"
              className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
            />
            <input
              value={value.accentColor}
              onChange={(e) => onChange("accentColor", e.target.value)}
              aria-label="Accent color hex value"
              className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm uppercase text-neutral-900 outline-none focus:border-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
            />
          </div>
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Tagline
        </span>
        <input
          value={value.tagline}
          onChange={(e) => onChange("tagline", e.target.value)}
          placeholder="e.g., Beauty that shines"
          className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Hero headline
        </span>
        <input
          value={value.heroTitle}
          onChange={(e) => onChange("heroTitle", e.target.value)}
          placeholder="Leave blank to use your store name"
          className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          Hero description
        </span>
        <textarea
          value={value.heroDescription}
          onChange={(e) => onChange("heroDescription", e.target.value)}
          rows={3}
          placeholder="One or two sentences under your headline"
          className="mt-1.5 w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
        />
      </label>
    </div>
  );
}