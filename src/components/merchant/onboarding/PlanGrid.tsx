"use client";

import { useOnboardingPlans } from "@/lib/merchant/onboarding/use-onboarding-plans";
import { SubscriptionPlanTile } from "@/components/merchant/subscriptions/subscription-plan-tile";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";
import {
  getCategoryBenchmark,
  salesToCoverPlan,
} from "@/lib/merchant/onboarding/benchmarks";
import {
  TRIAL_PLAN_CODE,
  DEFAULT_TRIAL_DAYS,
} from "@/lib/merchant/subscription/constants";
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

  const trialBadgeText = DEFAULT_TRIAL_DAYS + " days free";

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
            const monthly = monthlyNumeric(plan);
            const daily = monthly > 0 ? Math.round(monthly / 30) : 0;
            const salesNeeded =
              monthly > 0 ? salesToCoverPlan(monthly, category) : 0;

            const annualNumeric =
              typeof plan.annualPriceGHS === "number"
                ? plan.annualPriceGHS
                : 0;
            const annualSaving =
              isAnnual && monthly > 0 && annualNumeric > 0
                ? monthly * 12 - annualNumeric
                : 0;

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

            const salesLine =
              salesNeeded === 1
                ? "About 1 sale covers this month."
                : "About " + salesNeeded + " sales cover this month.";

            const isTrialRecommended = plan.code === TRIAL_PLAN_CODE;

            const badge = selected
              ? "selected"
              : isTrialRecommended
              ? "trial_recommended"
              : plan.highlighted
              ? "most_chosen"
              : null;

            const secondaryPriceLine =
              monthly > 0 && !isAnnual && !bespoke
                ? "About GH\u20B5 " + daily + " per day"
                : null;

            const savingsLine =
              annualSaving > 0
                ? "You save GH\u20B5 " + annualSaving + " this year."
                : null;

            const contextBox =
              salesNeeded > 0 && monthly > 0 ? (
                <div className="rounded-lg bg-neutral-100 px-3 py-2.5 text-xs leading-relaxed text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  <p>{salesLine}</p>
                  <p className="mt-0.5 text-neutral-500 dark:text-neutral-500">
                    Typical {category} sale is GH\u20B5{" "}
                    {benchmark.averageSalePriceGHS}.
                  </p>
                </div>
              ) : null;

            const comparisonLines: string[] = [];
            if (cheaperDelta > 0 && cheaper) {
              comparisonLines.push(
                "GH\u20B5 " +
                  cheaperDelta +
                  " more than " +
                  cheaper.name
              );
            }
            if (moreExpensiveDelta > 0 && moreExpensive) {
              comparisonLines.push(
                "GH\u20B5 " +
                  moreExpensiveDelta +
                  " less than " +
                  moreExpensive.name
              );
            }

            const actionLabel = selected
              ? "Selected"
              : bespoke
              ? "Contact sales"
              : "Select " + plan.name;

            const actionHelper = isTrialRecommended
              ? "Free for 7 days. Full access to everything."
              : null;

            return (
              <SubscriptionPlanTile
                key={plan.code}
                plan={plan}
                billingCycle={billingCycle}
                badge={badge}
                trialBadge={trialBadgeText}
                emphasized={selected}
                secondaryPriceLine={secondaryPriceLine}
                savingsLine={savingsLine}
                contextBox={contextBox}
                comparisonLines={comparisonLines}
                actionLabel={actionLabel}
                actionHelper={actionHelper}
                actionDisabled={selected}
                onAction={() => onPlanChange(plan.code)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}