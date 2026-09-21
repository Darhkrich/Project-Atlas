"use client";

import type {
  PromotionAudience,
  PromotionServiceCategory,
} from "@/lib/admin/types/promotion";
import type { ResellerTier } from "@/lib/admin/types/commission";
import { Input } from "@/components/admin/ui/input";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";
import {
  ALL_PROMOTION_SERVICES,
  PROMOTION_SERVICE_LABEL,
} from "@/lib/admin/promotions/promotion-labels";

export interface ConditionsDraft {
  minOrders: string;
  firstOrderOnly: boolean;
  minSpendGHS: string;
  maxSpendGHS: string;
  serviceScope: PromotionServiceCategory[];
  tierIds: string[];
}

interface PromotionConditionsEditorProps {
  audience: PromotionAudience;
  draft: ConditionsDraft;
  tiers: ResellerTier[];
  errors: Record<string, string>;
  onChange: (patch: Partial<ConditionsDraft>) => void;
}

export function PromotionConditionsEditor({
  audience,
  draft,
  tiers,
  errors,
  onChange,
}: PromotionConditionsEditorProps) {
  const showTiers = audience === "reseller";

  const toggleService = (s: PromotionServiceCategory) => {
    onChange({
      serviceScope: draft.serviceScope.includes(s)
        ? draft.serviceScope.filter((x) => x !== s)
        : [...draft.serviceScope, s],
    });
  };

  const toggleTier = (id: string) => {
    onChange({
      tierIds: draft.tierIds.includes(id)
        ? draft.tierIds.filter((x) => x !== id)
        : [...draft.tierIds, id],
    });
  };

  return (
    <>
      <label className="flex items-center gap-2 rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800">
        <input
          type="checkbox"
          checked={draft.firstOrderOnly}
          onChange={(e) => onChange({ firstOrderOnly: e.target.checked })}
          className="h-4 w-4"
        />
        <span>First order only</span>
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <SettingsField
          label="Min orders"
          htmlFor="promo-min-orders"
          hint="Leave blank for no minimum."
          error={errors.minOrders}
        >
          <Input
            id="promo-min-orders"
            type="number"
            min={0}
            value={draft.minOrders}
            onChange={(e) => onChange({ minOrders: e.target.value })}
            placeholder="e.g. 3"
          />
        </SettingsField>
        <SettingsField
          label="Min spend (GHS)"
          htmlFor="promo-min-spend"
          hint="Optional."
          error={errors.minSpendGHS}
        >
          <Input
            id="promo-min-spend"
            type="number"
            min={0}
            step="0.01"
            value={draft.minSpendGHS}
            onChange={(e) => onChange({ minSpendGHS: e.target.value })}
            placeholder="e.g. 500"
          />
        </SettingsField>
        <SettingsField
          label="Max spend (GHS)"
          htmlFor="promo-max-spend"
          hint="Optional."
          error={errors.maxSpendGHS}
        >
          <Input
            id="promo-max-spend"
            type="number"
            min={0}
            step="0.01"
            value={draft.maxSpendGHS}
            onChange={(e) => onChange({ maxSpendGHS: e.target.value })}
            placeholder="e.g. 5000"
          />
        </SettingsField>
      </div>

      <SettingsField
        label="Service scope"
        htmlFor="promo-services"
        hint="When set, this promotion only fires on the selected services."
      >
        <div
          id="promo-services"
          className="flex flex-wrap gap-2 rounded-md border border-neutral-300 p-2 dark:border-neutral-700"
        >
          {ALL_PROMOTION_SERVICES.map((s) => {
            const active = draft.serviceScope.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleService(s)}
                aria-pressed={active}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  active
                    ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                )}
              >
                {PROMOTION_SERVICE_LABEL[s]}
              </button>
            );
          })}
        </div>
      </SettingsField>

      {showTiers && tiers.length > 0 && (
        <SettingsField
          label="Tier scope"
          htmlFor="promo-tiers"
          hint="Leave blank for all tiers."
        >
          <div
            id="promo-tiers"
            className="flex flex-wrap gap-2 rounded-md border border-neutral-300 p-2 dark:border-neutral-700"
          >
            {tiers.map((t) => {
              const active = draft.tierIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTier(t.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                    active
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  )}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </SettingsField>
      )}
    </>
  );
}