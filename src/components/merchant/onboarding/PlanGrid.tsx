"use client";

import { PlanFeature } from "./PlanFeature";
import { useOnboardingPlans } from "@/lib/merchant/onboarding/use-onboarding-plans";
import { projectPlanRowSummary } from "@/lib/domains/subscriptions";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";
import {
  getCategoryBenchmark,
  salesToCoverPlan,
} from "@/lib/merchant/onboarding/benchmarks";
import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

type BillingCycle = "monthly" | "annual";

interface PlanGridProps {
  value: string;
  billingCycle: BillingCycle;
  category: MerchantTemplateCategory;
  onPlanChange: (code: string) => void;
  onCycleChange: (cycle: BillingCycle) => void;
}

function monthlyNumeric(plan: SubscriptionPlan): number {
  return typeof plan.monthlyPriceGHS === "number" ? plan.monthlyPriceGHS : 0;
}

function isBespoke(plan: SubscriptionPlan): boolean {
  return typeof plan.monthlyPriceGHS !== "number";
}

export function PlanGrid({
  value,
  billingCycle,
  category,
  onPlanChange,
  onCycleChange,
}: PlanGridProps) {
  const { plans, loading } = useOnboardingPlans();
  const isAnnual = billingCycle === "annual";
  const benchmark = getCategoryBenchmark(category);

  const visiblePlans = [...plans]
    .filter((p) => p.visibility === "public")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      <div>
        <span className="block text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Billing cycle
        </span>
        <div
          role="radiogroup"
          aria-label="Billing cycle"
          className="mt-2 flex gap-2"
        >
          {(["monthly", "annual"] as BillingCycle[]).map((cycle) => {
            const selected = billingCycle === cycle;
            return (
              <button
                key={cycle}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => onCycleChange(cycle)}
                className={
                  "rounded-lg border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 " +
                  (selected
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300")
                }
              >
                {cycle === "monthly" ? "Monthly" : "Annual"}
              </button>
            );
          })}
        </div>
      </div>

      {loading && visiblePlans.length === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
          Loading plans.
        </div>
      )}

      {!loading && visiblePlans.length === 0 && (
        <div
          role="alert"
          className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300"
        >
          No plans are available right now. Contact support.
        </div>
      )}

      {visiblePlans.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visiblePlans.map((plan, index) => {
            const selected = value === plan.code;
            const bespoke = isBespoke(plan);
            const summary = projectPlanRowSummary(plan);
            const monthly = monthlyNumeric(plan);
            const daily = monthly > 0 ? Math.round(monthly / 30) : 0;
            const salesNeeded =
              monthly > 0 ? salesToCoverPlan(monthly, category) : 0;

            const displayPrice = bespoke
              ? "Custom"
              : isAnnual
              ? summary.annualLabel
              : summary.monthlyLabel;
            const period = bespoke
              ? "Contact us"
              : isAnnual
              ? "per year"
              : "per month";

            const cheaper =
              index > 0 && !bespoke && !isBespoke(visiblePlans[index - 1])
                ? visiblePlans[index - 1]
                : null;
            const moreExpensive =
              index < visiblePlans.length - 1 &&
              !bespoke &&
              !isBespoke(visiblePlans[index + 1])
                ? visiblePlans[index + 1]
                : null;

            const cheaperDelta =
              cheaper && monthly > monthlyNumeric(cheaper)
                ? monthly - monthlyNumeric(cheaper)
                : 0;
            const moreExpensiveDelta =
              moreExpensive && monthlyNumeric(moreExpensive) > monthly
                ? monthlyNumeric(moreExpensive) - monthly
                : 0;

            const annualNumeric =
              typeof plan.annualPriceGHS === "number"
                ? plan.annualPriceGHS
                : 0;
            const annualSaving =
              isAnnual && monthly > 0 && annualNumeric > 0
                ? monthly * 12 - annualNumeric
                : 0;

            const productsLabel =
              plan.maxProducts === "unlimited"
                ? "Unlimited products"
                : "Up to " + plan.maxProducts + " products";

            const salesLine =
              salesNeeded === 1
                ? "About 1 sale covers this month."
                : "About " + salesNeeded + " sales cover this month.";

            return (
              <div
                key={plan.code}
                className={
                  "relative flex flex-col rounded-2xl border-2 p-5 transition " +
                  (selected
                    ? "border-brand-600 bg-brand-50 shadow-lg dark:border-brand-500 dark:bg-brand-900/20"
                    : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600")
                }
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-5 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Most chosen
                  </span>
                )}

                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {plan.name}
                  </h3>
                  {selected && (
                    <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Selected
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {plan.description}
                </p>

                <div className="mt-3 flex items-baseline gap-2">
                  <p className="whitespace-nowrap text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {displayPrice}
                  </p>
                  <p className="text-sm text-neutral-500">{period}</p>
                </div>

                {monthly > 0 && !isAnnual && (
                  <p className="mt-1 text-xs text-neutral-500">
                    About GH{"\u20B5"}
                    {daily} per day
                  </p>
                )}
                {annualSaving > 0 && (
                  <p className="mt-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                    You save GH{"\u20B5"}
                    {annualSaving} this year.
                  </p>
                )}

                {salesNeeded > 0 && monthly > 0 && (
                  <div className="mt-4 rounded-lg bg-neutral-100 px-3 py-2.5 text-xs leading-relaxed text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    <p>{salesLine}</p>
                    <p className="mt-0.5 text-neutral-500">
                      Typical {category} sale is GH{"\u20B5"}
                      {benchmark.averageSalePriceGHS}.
                    </p>
                  </div>
                )}

                <ul role="list" className="mt-4 flex-1 space-y-2">
                  <PlanFeature label={productsLabel} />
                  <PlanFeature label={summary.supportLabel + " support"} />
                  <PlanFeature label={summary.domainLabel} />
                  <PlanFeature
                    label={
                      plan.themes.length +
                      " theme" +
                      (plan.themes.length === 1 ? "" : "s")
                    }
                  />
                  <PlanFeature
                    label={
                      plan.paymentMethods.length +
                      " payment method" +
                      (plan.paymentMethods.length === 1 ? "" : "s")
                    }
                  />
                  {plan.aiAssistant && (
                    <PlanFeature label="AI storefront assistant" />
                  )}
                </ul>

                {(cheaperDelta > 0 || moreExpensiveDelta > 0) && (
                  <div className="mt-4 space-y-1 text-xs text-neutral-500">
                    {cheaperDelta > 0 && cheaper && (
                      <p>
                        GH{"\u20B5"}
                        {cheaperDelta} more than {cheaper.name}
                      </p>
                    )}
                    {moreExpensiveDelta > 0 && moreExpensive && (
                      <p>
                        GH{"\u20B5"}
                        {moreExpensiveDelta} less than {moreExpensive.name}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onPlanChange(plan.code)}
                  aria-pressed={selected}
                  className={
                    "mt-5 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 " +
                    (selected
                      ? "bg-brand-600 text-white"
                      : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700")
                  }
                >
                  {selected
                    ? "Selected"
                    : bespoke
                    ? "Contact sales"
                    : "Select " + plan.name}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}