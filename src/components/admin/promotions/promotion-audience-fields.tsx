"use client";

import type {
  PromotionAudience,
  PromotionSurface,
} from "@/lib/admin/types/promotion";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";
import {
  ALL_PROMOTION_SURFACES,
  PROMOTION_AUDIENCE_LABEL,
  PROMOTION_SURFACE_LABEL,
} from "@/lib/admin/promotions/promotion-labels";

interface PromotionAudienceFieldsProps {
  audience: PromotionAudience;
  surfaces: PromotionSurface[];
  errors: Record<string, string>;
  onAudienceChange: (audience: PromotionAudience) => void;
  onToggleSurface: (surface: PromotionSurface) => void;
}

const AUDIENCES: PromotionAudience[] = ["customer", "reseller", "merchant"];

export function PromotionAudienceFields({
  audience,
  surfaces,
  errors,
  onAudienceChange,
  onToggleSurface,
}: PromotionAudienceFieldsProps) {
  return (
    <>
      <SettingsField
        label="Audience"
        htmlFor="promo-audience"
        required
        hint="One audience per promotion. For multiple audiences, create separate promotions."
        error={errors.audience}
      >
        <div
          id="promo-audience"
          role="group"
          aria-label="Audience"
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {AUDIENCES.map((a) => {
            const active = audience === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => onAudienceChange(a)}
                aria-pressed={active}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-300"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                )}
              >
                {PROMOTION_AUDIENCE_LABEL[a]}
              </button>
            );
          })}
        </div>
      </SettingsField>

      <SettingsField
        label="Surfaces"
        htmlFor="promo-surfaces"
        required
        hint="Where this promotion renders. Choose at least one."
        error={errors.surfaces}
      >
        <div
          id="promo-surfaces"
          className="flex flex-wrap gap-2 rounded-md border border-neutral-300 p-2 dark:border-neutral-700"
        >
          {ALL_PROMOTION_SURFACES.map((s) => {
            const active = surfaces.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => onToggleSurface(s)}
                aria-pressed={active}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  active
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                )}
              >
                {PROMOTION_SURFACE_LABEL[s]}
              </button>
            );
          })}
        </div>
      </SettingsField>
    </>
  );
}