"use client";

import { PlanGrid } from "./PlanGrid";
import { StepHeader } from "./StepHeader";
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
        description="Your store stays free to set up. You pay for what you use to sell. You can change plans anytime."
      />

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