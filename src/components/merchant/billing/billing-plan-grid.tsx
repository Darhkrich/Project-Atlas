"use client";

import { useMemo } from "react";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { BillingPlanCard, type PlanActionMode } from "./billing-plan-card";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";
import type { BillingCycle } from "@/lib/merchant/subscription/types";

interface Props {
  plans: SubscriptionPlan[];
  currentPlanCode: string;
  currentCycle: BillingCycle;
  displayCycle: BillingCycle;
  loading: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
}

function deriveActionMode(
  plan: SubscriptionPlan,
  currentPlan: SubscriptionPlan | undefined,
  currentCycle: BillingCycle,
  displayCycle: BillingCycle
): PlanActionMode {
  if (typeof plan.monthlyPriceGHS !== "number") return "custom";
  if (currentPlan && plan.code === currentPlan.code) {
    if (currentCycle !== displayCycle) {
      return displayCycle === "annual" ? "cycle_upgrade" : "cycle_downgrade";
    }
    return "current";
  }
  if (!currentPlan) return "upgrade";

  const currentRaw =
    currentCycle === "monthly"
      ? currentPlan.monthlyPriceGHS
      : currentPlan.annualPriceGHS;
  const targetRaw =
    displayCycle === "monthly"
      ? plan.monthlyPriceGHS
      : plan.annualPriceGHS;
  if (typeof currentRaw !== "number" || typeof targetRaw !== "number") {
    return "upgrade";
  }
  if (targetRaw > currentRaw) return "upgrade";
  if (targetRaw < currentRaw) return "downgrade";
  return "current";
}

export function BillingPlanGrid({
  plans,
  currentPlanCode,
  currentCycle,
  displayCycle,
  loading,
  onSelect,
}: Props) {
  const visiblePlans = useMemo(
    () =>
      [...plans]
        .filter(
          (p) =>
            p.visibility === "public" || p.code === currentPlanCode
        )
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [plans, currentPlanCode]
  );

  const currentPlan = useMemo(
    () => plans.find((p) => p.code === currentPlanCode),
    [plans, currentPlanCode]
  );

  if (loading && visiblePlans.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <AtlasSkeleton key={i} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (visiblePlans.length === 0) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-900/40 dark:bg-danger-900/20 dark:text-danger-300"
      >
        No plans are available right now. Contact support.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visiblePlans.map((plan) => {
        const mode = deriveActionMode(
          plan,
          currentPlan,
          currentCycle,
          displayCycle
        );
        return (
          <BillingPlanCard
            key={plan.code}
            plan={plan}
            displayCycle={displayCycle}
            mode={mode}
            onSelect={() => onSelect(plan)}
          />
        );
      })}
    </div>
  );
}