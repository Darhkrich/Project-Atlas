"use client";

import { SubscriptionPlanTile } from "@/components/merchant/subscriptions/subscription-plan-tile";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";
import type { BillingCycle } from "@/lib/merchant/subscription/types";

export type PlanActionMode =
  | "current"
  | "upgrade"
  | "downgrade"
  | "cycle_upgrade"
  | "cycle_downgrade"
  | "custom";

interface Props {
  plan: SubscriptionPlan;
  displayCycle: BillingCycle;
  mode: PlanActionMode;
  disabled?: boolean;
  onSelect: () => void;
}

function actionLabel(mode: PlanActionMode): string {
  if (mode === "current") return "Current plan";
  if (mode === "upgrade") return "Upgrade now";
  if (mode === "downgrade") return "Schedule change";
  if (mode === "cycle_upgrade") return "Switch to annual";
  if (mode === "cycle_downgrade") return "Switch to monthly";
  return "Contact sales";
}

function helperLine(mode: PlanActionMode): string | null {
  if (mode === "downgrade" || mode === "cycle_downgrade") {
    return "Takes effect at the end of your current cycle.";
  }
  if (mode === "upgrade" || mode === "cycle_upgrade") {
    return "Charged now, plan changes immediately.";
  }
  if (mode === "custom") {
    return "Bespoke terms and pricing. Atlas will follow up.";
  }
  return null;
}

function secondaryPriceLine(
  plan: SubscriptionPlan,
  displayCycle: BillingCycle
): string | null {
  if (displayCycle !== "annual") return null;
  if (typeof plan.monthlyPriceGHS !== "number") return null;
  const monthly = plan.monthlyPriceGHS;
  return "Billed annually \u00B7 GH\u20B5 " + monthly + " equivalent monthly";
}

export function BillingPlanCard({
  plan,
  displayCycle,
  mode,
  disabled,
  onSelect,
}: Props) {
  const isCurrent = mode === "current";

  const badge = isCurrent
    ? "current"
    : plan.highlighted
    ? "most_chosen"
    : null;

  return (
    <SubscriptionPlanTile
      plan={plan}
      billingCycle={displayCycle}
      badge={badge}
      emphasized={isCurrent}
      secondaryPriceLine={secondaryPriceLine(plan, displayCycle)}
      actionLabel={actionLabel(mode)}
      actionHelper={helperLine(mode)}
      actionDisabled={isCurrent || disabled}
      onAction={onSelect}
    />
  );
}