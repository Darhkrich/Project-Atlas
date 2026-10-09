"use client";

import { DEFAULT_BRAND_COLORS } from "@/lib/reseller/onboarding/constants";

interface BrandColorPickerProps {
  primaryColor: string;
  accentColor: string;
  onChange: (primary: string, accent: string) => void;
}

export function BrandColorPicker({
  primaryColor,
  accentColor,
  onChange,
}: BrandColorPickerProps) {
  return (
    <fieldset>
      <legend className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
        Brand colors
      </legend>
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {DEFAULT_BRAND_COLORS.map((swatch) => {
          const selected =
            swatch.primary === primaryColor && swatch.accent === accentColor;
          return (
            <button
              key={swatch.name}
              type="button"
              aria-pressed={selected}
              aria-label={swatch.name}
              onClick={() => onChange(swatch.primary, swatch.accent)}
              className={
                "flex items-center justify-center rounded-lg border-2 p-2 transition-colors " +
                (selected
                  ? "border-brand-600 dark:border-brand-500"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700")
              }
            >
              <span
                aria-hidden="true"
                className="h-6 w-6 rounded-full"
                style={{
                  background: swatch.primary,
                  boxShadow:
                    "0 0 0 2px white, 0 0 0 3px " + swatch.accent,
                }}
              />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}