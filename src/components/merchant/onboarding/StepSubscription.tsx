"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { PlanGrid } from "./PlanGrid";
import { StepHeader } from "./StepHeader";
import { DEFAULT_TRIAL_DAYS } from "@/lib/merchant/subscription/constants";
import type { MerchantOnboardingDraft } from "@/lib/merchant/onboarding/types";

type BillingCycle = "monthly" | "annual";

interface StepSubscriptionProps {
  draft: MerchantOnboardingDraft;
  onPlanChange: (code: string) => void;
  onCycleChange: (cycle: BillingCycle) => void;
}

export default function StepSubscription({
  draft,
  onPlanChange,
  onCycleChange,
}: StepSubscriptionProps) {
  return (
    <div className="space-y-6">
      <StepHeader
        title="Choose your plan"
        description="Your store stays free to set up. Your first charge is on day 8."
      />

      <div className="rounded-2xl border border-accent-500/40 bg-accent-500/5 p-4 dark:border-accent-500/30">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-500 text-neutral-950">
            <AtlasIcon name="star" className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-950 dark:text-white">
              {DEFAULT_TRIAL_DAYS} days free. Full Pro access. No charge yet.
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
              Try Atlas free for {DEFAULT_TRIAL_DAYS} days with everything Pro
              has to offer. Pick the plan you want to keep. Your first charge
              happens on day {DEFAULT_TRIAL_DAYS + 1}.
            </p>
          </div>
        </div>
      </div>

      <PlanGrid
        value={draft.planId}
        billingCycle={draft.billingCycle}
        category={draft.businessCategory}
        onPlanChange={onPlanChange}
        onCycleChange={onCycleChange}
      />
    </div>
  );
}