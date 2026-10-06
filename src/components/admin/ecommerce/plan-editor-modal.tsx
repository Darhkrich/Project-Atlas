/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { cn } from "@/lib/utils";
import {
  ALL_PAYMENT_METHODS,
  ALL_THEMES,
  DEFAULT_VISIBILITY,
  PAYMENT_METHOD_LABEL,
  PLAN_VISIBILITY_HELP,
  PLAN_VISIBILITY_LABEL,
  SUPPORT_TIER_LABEL,
  THEME_LABEL,
  validatePlanInput,
  planCodeSetFor,
} from "@/lib/domains/subscriptions";
import type {
  CreatePlanInput,
  PlanVisibility,
  StorefrontPaymentMethod,
  StorefrontTheme,
  SubscriptionPlan,
  SupportTier,
  UpdatePlanInput,
} from "@/lib/domains/subscriptions";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  plan: SubscriptionPlan | null;
  existingPlans: SubscriptionPlan[];
  onClose: () => void;
  onCreate: (input: CreatePlanInput) => { ok: boolean; error?: string };
  onUpdate: (
    code: string,
    patch: UpdatePlanInput
  ) => { ok: boolean; error?: string };
}

interface Draft {
  code: string;
  name: string;
  description: string;
  monthlyPriceGHS: number | "custom";
  annualPriceGHS: number | "custom";
  maxProducts: number | "unlimited";
  themes: StorefrontTheme[];
  paymentMethods: StorefrontPaymentMethod[];
  subdomain: boolean;
  customDomain: boolean;
  supportTier: SupportTier;
  aiAssistant: boolean;
  visibility: PlanVisibility;
  highlighted: boolean;
}

const EMPTY_DRAFT: Draft = {
  code: "",
  name: "",
  description: "",
  monthlyPriceGHS: 0,
  annualPriceGHS: 0,
  maxProducts: 20,
  themes: ["studio"],
  paymentMethods: ["momo"],
  subdomain: true,
  customDomain: false,
  supportTier: "email",
  aiAssistant: false,
  visibility: DEFAULT_VISIBILITY,
  highlighted: false,
};

function draftFrom(plan: SubscriptionPlan): Draft {
  return {
    code: plan.code,
    name: plan.name,
    description: plan.description ?? "",
    monthlyPriceGHS: plan.monthlyPriceGHS,
    annualPriceGHS: plan.annualPriceGHS,
    maxProducts: plan.maxProducts,
    themes: [...plan.themes],
    paymentMethods: [...plan.paymentMethods],
    subdomain: plan.subdomain,
    customDomain: plan.customDomain,
    supportTier: plan.supportTier,
    aiAssistant: plan.aiAssistant,
    visibility: plan.visibility,
    highlighted: plan.highlighted,
  };
}

const SUPPORT_TIERS: SupportTier[] = [
   "dedicated",
];

const VISIBILITIES: PlanVisibility[] = ["public", "hidden", "legacy"];

export function PlanEditorModal({
  open,
  mode,
  plan,
  existingPlans,
  onClose,
  onCreate,
  onUpdate,
}: Props) {
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);

  const codeSet = useMemo(
    () => planCodeSetFor(existingPlans, plan?.code),
    [existingPlans, plan]
  );

  useEffect(() => {
    if (!open) return;
    setDraft(plan ? draftFrom(plan) : EMPTY_DRAFT);
    setError(null);
  }, [open, plan]);

  if (!open) return null;

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const toggleTheme = (theme: StorefrontTheme) => {
    setDraft((d) => ({
      ...d,
      themes: d.themes.includes(theme)
        ? d.themes.filter((t) => t !== theme)
        : [...d.themes, theme],
    }));
  };

  const toggleMethod = (method: StorefrontPaymentMethod) => {
    setDraft((d) => ({
      ...d,
      paymentMethods: d.paymentMethods.includes(method)
        ? d.paymentMethods.filter((m) => m !== method)
        : [...d.paymentMethods, method],
    }));
  };

  const handleSubmit = () => {
    const input: CreatePlanInput = {
      code: draft.code.trim().toLowerCase(),
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      monthlyPriceGHS: draft.monthlyPriceGHS,
      annualPriceGHS: draft.annualPriceGHS,
      maxProducts: draft.maxProducts,
      themes: draft.themes,
      paymentMethods: draft.paymentMethods,
      subdomain: draft.subdomain,
      customDomain: draft.customDomain,
      supportTier: draft.supportTier,
      aiAssistant: draft.aiAssistant,
      visibility: draft.visibility,
      highlighted: draft.highlighted,
    };

    const validation = validatePlanInput(input, codeSet);
    if (!validation.ok) {
      setError(Object.values(validation.errors)[0] ?? "Invalid input.");
      return;
    }

    const result =
      mode === "create"
        ? onCreate(input)
        : onUpdate(draft.code, {
            name: input.name,
            description: input.description,
            monthlyPriceGHS: input.monthlyPriceGHS,
            annualPriceGHS: input.annualPriceGHS,
            maxProducts: input.maxProducts,
            themes: input.themes,
            paymentMethods: input.paymentMethods,
            subdomain: input.subdomain,
            customDomain: input.customDomain,
            supportTier: input.supportTier,
            aiAssistant: input.aiAssistant,
            visibility: input.visibility,
            highlighted: input.highlighted,
          });

    if (!result.ok) {
      setError(result.error ?? "Could not save plan.");
      return;
    }
    onClose();
  };

  const monthlyCustom = draft.monthlyPriceGHS === "custom";
  const annualCustom = draft.annualPriceGHS === "custom";
  const unlimitedProducts = draft.maxProducts === "unlimited";

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={mode === "create" ? "New subscription plan" : "Edit " + draft.name}
      description="Subscription plans are the SaaS tiers merchants choose at onboarding. Distinct from service pricing in the catalog."
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {mode === "create" ? "Create plan" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Identity
          </h3>

          {mode === "create" && (
            <SettingsField
              label="Code"
              htmlFor="plan-code"
              required
              hint="Lowercase letters, digits, dashes. Cannot be changed after creation."
            >
              <Input
                id="plan-code"
                value={draft.code}
                onChange={(e) => {
                  set({ code: e.target.value });
                  setError(null);
                }}
                placeholder="e.g. standard"
                autoFocus
              />
            </SettingsField>
          )}

          <SettingsField label="Name" htmlFor="plan-name" required>
            <Input
              id="plan-name"
              value={draft.name}
              onChange={(e) => {
                set({ name: e.target.value });
                setError(null);
              }}
              placeholder="e.g. Standard"
            />
          </SettingsField>

          <SettingsField
            label="Description"
            htmlFor="plan-description"
            hint="Short tagline shown on the plan card."
          >
            <textarea
              id="plan-description"
              className={cn(
                "min-h-[60px] w-full rounded-md border p-2 text-sm",
                "border-neutral-300 bg-white",
                "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              )}
              value={draft.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="One sentence about this plan."
            />
          </SettingsField>
        </section>

        <section className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Pricing
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingsField label="Monthly price (GHS)" htmlFor="plan-monthly">
              <div className="flex items-center gap-2">
                <Input
                  id="plan-monthly"
                  type="number"
                  min={0}
                  disabled={monthlyCustom}
                  value={monthlyCustom ? "" : String(draft.monthlyPriceGHS)}
                  onChange={(e) =>
                    set({ monthlyPriceGHS: Number(e.target.value) || 0 })
                  }
                />
                <label className="flex shrink-0 items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    checked={monthlyCustom}
                    onChange={(e) =>
                      set({
                        monthlyPriceGHS: e.target.checked ? "custom" : 0,
                      })
                    }
                  />
                  Custom
                </label>
              </div>
            </SettingsField>
            <SettingsField label="Annual price (GHS)" htmlFor="plan-annual">
              <div className="flex items-center gap-2">
                <Input
                  id="plan-annual"
                  type="number"
                  min={0}
                  disabled={annualCustom}
                  value={annualCustom ? "" : String(draft.annualPriceGHS)}
                  onChange={(e) =>
                    set({ annualPriceGHS: Number(e.target.value) || 0 })
                  }
                />
                <label className="flex shrink-0 items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    checked={annualCustom}
                    onChange={(e) =>
                      set({
                        annualPriceGHS: e.target.checked ? "custom" : 0,
                      })
                    }
                  />
                  Custom
                </label>
              </div>
            </SettingsField>
          </div>
        </section>

        <section className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Limits
          </h3>
          <SettingsField label="Max products" htmlFor="plan-products">
            <div className="flex items-center gap-2">
              <Input
                id="plan-products"
                type="number"
                min={1}
                disabled={unlimitedProducts}
                value={unlimitedProducts ? "" : String(draft.maxProducts)}
                onChange={(e) =>
                  set({ maxProducts: Number(e.target.value) || 1 })
                }
              />
              <label className="flex shrink-0 items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                <input
                  type="checkbox"
                  checked={unlimitedProducts}
                  onChange={(e) =>
                    set({ maxProducts: e.target.checked ? "unlimited" : 20 })
                  }
                />
                Unlimited
              </label>
            </div>
          </SettingsField>
        </section>

        <section className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Storefront
          </h3>

          <div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Themes
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {ALL_THEMES.map((theme) => {
                const active = draft.themes.includes(theme);
                return (
                  <button
                    key={theme}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleTheme(theme)}
                    className={
                      "rounded-full border px-3 py-1 text-xs font-medium transition " +
                      (active
                        ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/30 dark:text-brand-200"
                        : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800")
                    }
                  >
                    {THEME_LABEL[theme]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              Payment methods
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {ALL_PAYMENT_METHODS.map((method) => {
                const active = draft.paymentMethods.includes(method);
                return (
                  <button
                    key={method}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleMethod(method)}
                    className={
                      "rounded-full border px-3 py-1 text-xs font-medium transition " +
                      (active
                        ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/30 dark:text-brand-200"
                        : "border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800")
                    }
                  >
                    {PAYMENT_METHOD_LABEL[method]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={draft.subdomain}
                onChange={(e) => set({ subdomain: e.target.checked })}
              />
              Atlas subdomain
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={draft.customDomain}
                onChange={(e) => set({ customDomain: e.target.checked })}
              />
              Custom domain
            </label>
          </div>
        </section>

        <section className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Support and features
          </h3>

          <SettingsField label="Support tier" htmlFor="plan-support">
            <select
              id="plan-support"
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={draft.supportTier}
              onChange={(e) =>
                set({ supportTier: e.target.value as SupportTier })
              }
            >
              {SUPPORT_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {SUPPORT_TIER_LABEL[tier]}
                </option>
              ))}
            </select>
          </SettingsField>

          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={draft.aiAssistant}
              onChange={(e) => set({ aiAssistant: e.target.checked })}
            />
            AI assistant
          </label>
        </section>

        <section className="space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Lifecycle
          </h3>

          <SettingsField label="Visibility" htmlFor="plan-visibility">
            <select
              id="plan-visibility"
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              value={draft.visibility}
              onChange={(e) =>
                set({ visibility: e.target.value as PlanVisibility })
              }
            >
              {VISIBILITIES.map((v) => (
                <option key={v} value={v}>
                  {PLAN_VISIBILITY_LABEL[v]}
                </option>
              ))}
            </select>
          </SettingsField>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {PLAN_VISIBILITY_HELP[draft.visibility]}
          </p>

          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={draft.highlighted}
              onChange={(e) => set({ highlighted: e.target.checked })}
            />
            Mark as most popular
          </label>
        </section>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
}