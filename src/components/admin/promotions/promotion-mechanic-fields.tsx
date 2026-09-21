"use client";

import type {
  PromotionAudience,
  PromotionMechanic,
} from "@/lib/admin/types/promotion";
import { Input } from "@/components/admin/ui/input";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";
import {
  MECHANIC_KIND_LABEL,
  allowedMechanicsForAudience,
} from "@/lib/admin/promotions/promotion-labels";

interface MechanicDraft {
  kind: PromotionMechanic["kind"];
  discountMode: "percent" | "fixed";
  discountValue: string;
  cashbackPercent: string;
  pointsPerGHS: string;
  subscriptionPercent: string;
}

interface PromotionMechanicFieldsProps {
  audience: PromotionAudience;
  draft: MechanicDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<MechanicDraft>) => void;
}

export function PromotionMechanicFields({
  audience,
  draft,
  errors,
  onChange,
}: PromotionMechanicFieldsProps) {
  const allowed = allowedMechanicsForAudience(audience);

  return (
    <>
      <SettingsField
        label="Mechanic"
        htmlFor="promo-mechanic"
        required
        hint="What this promotion does when it applies."
        error={errors.mechanic}
      >
        <div
          id="promo-mechanic"
          role="group"
          aria-label="Mechanic"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
        >
          {allowed.map((k) => {
            const active = draft.kind === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onChange({ kind: k })}
                aria-pressed={active}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-300"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                )}
              >
                {MECHANIC_KIND_LABEL[k]}
              </button>
            );
          })}
        </div>
      </SettingsField>

      {draft.kind === "auto_discount" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField label="Discount type" htmlFor="promo-discount-mode" required>
            <select
              id="promo-discount-mode"
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={draft.discountMode}
              onChange={(e) =>
                onChange({
                  discountMode: e.target.value as "percent" | "fixed",
                })
              }
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed GHS off</option>
            </select>
          </SettingsField>
          <SettingsField
            label={
              draft.discountMode === "percent"
                ? "Percent off"
                : "Fixed GHS off"
            }
            htmlFor="promo-discount-value"
            required
            error={errors.mechanic}
          >
            <Input
              id="promo-discount-value"
              type="number"
              min={0}
              step="0.01"
              value={draft.discountValue}
              onChange={(e) => onChange({ discountValue: e.target.value })}
              placeholder={draft.discountMode === "percent" ? "10" : "5.00"}
            />
          </SettingsField>
        </div>
      )}

      {draft.kind === "cashback" && (
        <SettingsField
          label="Cashback percent"
          htmlFor="promo-cashback"
          required
          hint="Percent returned to the recipient's Atlas wallet."
          error={errors.mechanic}
        >
          <Input
            id="promo-cashback"
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={draft.cashbackPercent}
            onChange={(e) => onChange({ cashbackPercent: e.target.value })}
            placeholder="5"
          />
        </SettingsField>
      )}

      {draft.kind === "atlas_points" && (
        <SettingsField
          label="Points per GHS spent"
          htmlFor="promo-points"
          required
          hint="Available to customers only. 1 means one point per GHS spent."
          error={errors.mechanic}
        >
          <Input
            id="promo-points"
            type="number"
            min={0}
            step="0.1"
            value={draft.pointsPerGHS}
            onChange={(e) => onChange({ pointsPerGHS: e.target.value })}
            placeholder="1"
          />
        </SettingsField>
      )}

      {draft.kind === "subscription_discount" && (
        <SettingsField
          label="Subscription discount percent"
          htmlFor="promo-subscription"
          required
          hint="Applied to merchant subscription renewals."
          error={errors.mechanic}
        >
          <Input
            id="promo-subscription"
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={draft.subscriptionPercent}
            onChange={(e) =>
              onChange({ subscriptionPercent: e.target.value })
            }
            placeholder="25"
          />
        </SettingsField>
      )}
    </>
  );
}

export type { MechanicDraft };