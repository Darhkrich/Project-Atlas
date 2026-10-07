/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
"use client";

import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency, formatDate } from "@/lib/shared/format";
import type { SubscriptionPlan } from "@/lib/domains/subscriptions";
import type {
  BillingCycle,
  ChargePreview,
} from "@/lib/merchant/subscription/types";
import { BILLING_CYCLE_LABEL } from "@/lib/merchant/subscription/labels";
import { DAY_MS } from "@/lib/merchant/subscription/constants";

export type PlanChangeAction = "charge_now" | "defer" | "reactivate";

interface Props {
  open: boolean;
  action: PlanChangeAction;
  currentPlan: SubscriptionPlan | undefined;
  targetPlan: SubscriptionPlan;
  currentCycle: BillingCycle;
  targetCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  preview: ChargePreview | null;
  wasTrialing: boolean;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function modalTitle(
  action: PlanChangeAction,
  planName: string,
  wasTrialing: boolean
): string {
  if (action === "reactivate") return "Restart " + planName;
  if (action === "defer") return "Switch to " + planName;
  if (wasTrialing) return "Start " + planName;
  return "Upgrade to " + planName;
}

export function PlanChangeModal({
  open,
  action,
  currentPlan,
  targetPlan,
  currentCycle,
  targetCycle,
  currentPeriodStart,
  currentPeriodEnd,
  preview,
  wasTrialing,
  submitting,
  onConfirm,
  onCancel,
}: Props) {
  const cycleChanged = currentCycle !== targetCycle;
  const samePlan = currentPlan?.code === targetPlan.code;

  const remainingDays = preview
    ? Math.max(
        1,
        Math.ceil(
          (new Date(currentPeriodEnd).getTime() - Date.now()) / DAY_MS
        )
      )
    : 0;

  return (
    <AtlasModalShell
      open={open}
      onClose={onCancel}
      title={modalTitle(action, targetPlan.name, wasTrialing)}
      description={
        action === "defer"
          ? "This change applies at the end of your current cycle."
          : undefined
      }
    >
      <div className="space-y-4">
        {action === "charge_now" && wasTrialing && (
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            Your {DAY_MS > 0 ? "7 day" : ""} free trial ends today. You are
            charged the first cycle of {targetPlan.name}, and your first
            billing cycle starts now. You can change plans any time.
          </p>
        )}

        {action === "charge_now" && !wasTrialing && samePlan && (
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            You are switching from{" "}
            {BILLING_CYCLE_LABEL[currentCycle]} to{" "}
            {BILLING_CYCLE_LABEL[targetCycle]} billing. You pay the daily-rate
            difference for the remaining {remainingDays}{" "}
            {remainingDays === 1 ? "day" : "days"} of your current cycle. Your
            cycle end date does not change. At that date you renew at the full{" "}
            {BILLING_CYCLE_LABEL[targetCycle]} price.
          </p>
        )}

        {action === "charge_now" && !wasTrialing && !samePlan && (
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            You pay the daily-rate difference from {currentPlan?.name ?? "your current plan"}{" "}
            to {targetPlan.name} for the remaining {remainingDays}{" "}
            {remainingDays === 1 ? "day" : "days"} of your current cycle. Your
            cycle end date does not change. At that date you renew at the full{" "}
            {targetPlan.name} price.
          </p>
        )}

        {action === "defer" && samePlan && (
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            Your {BILLING_CYCLE_LABEL[currentCycle]} cycle runs to completion
            on {formatDate(currentPeriodEnd)}. Your next cycle starts then at
            the {BILLING_CYCLE_LABEL[targetCycle]} price. No charge today.
          </p>
        )}

        {action === "defer" && !samePlan && (
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {currentPlan?.name ?? "Your plan"} runs to completion on{" "}
            {formatDate(currentPeriodEnd)}. {targetPlan.name} starts then. No
            charge today.
          </p>
        )}

        {action === "reactivate" && (
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            Your plan resumes on {targetPlan.name}. Renews automatically at the
            end of the current cycle. No charge today.
          </p>
        )}

        <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
          <div className="flex justify-between py-1">
            <span className="text-neutral-500 dark:text-neutral-400">
              {action === "defer" ? "Changes on" : "New plan"}
            </span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {action === "defer"
                ? formatDate(currentPeriodEnd)
                : targetPlan.name}
            </span>
          </div>

          {action === "charge_now" && !wasTrialing && (
            <div className="flex justify-between py-1">
              <span className="text-neutral-500 dark:text-neutral-400">
                Current cycle ends
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {formatDate(currentPeriodEnd)}
              </span>
            </div>
          )}

          {action === "charge_now" && wasTrialing && preview && (
            <div className="flex justify-between py-1">
              <span className="text-neutral-500 dark:text-neutral-400">
                First cycle ends
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {formatDate(preview.periodEnd)}
              </span>
            </div>
          )}

          {cycleChanged && (
            <div className="flex justify-between py-1">
              <span className="text-neutral-500 dark:text-neutral-400">
                Billing cycle
              </span>
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {BILLING_CYCLE_LABEL[currentCycle]} to{" "}
                {BILLING_CYCLE_LABEL[targetCycle]}
              </span>
            </div>
          )}

          {action === "charge_now" && preview && preview.isProrated && (
            <>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500 dark:text-neutral-400">
                  Billing basis
                </span>
                <span className="text-neutral-700 dark:text-neutral-300">
                  Prorated for {remainingDays}{" "}
                  {remainingDays === 1 ? "day" : "days"} remaining
                </span>
              </div>
              {preview.discountAmountGHS > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Discount applied
                  </span>
                  <span className="text-success-700 dark:text-success-300">
                    {"\u2212"}
                    {formatCurrency(preview.discountAmountGHS)}
                  </span>
                </div>
              )}
            </>
          )}

          {action === "charge_now" && preview && wasTrialing && (
            <div className="flex justify-between py-1">
              <span className="text-neutral-500 dark:text-neutral-400">
                Billing basis
              </span>
              <span className="text-neutral-700 dark:text-neutral-300">
                First full cycle
              </span>
            </div>
          )}

          <div className="mt-1 flex justify-between border-t border-neutral-200 pt-2 dark:border-neutral-700">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              Charged today
            </span>
            <span className="font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
              {action === "charge_now" && preview
                ? formatCurrency(preview.amountGHS)
                : formatCurrency(0)}
            </span>
          </div>

          {action === "charge_now" && !wasTrialing && (
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                Renews on {formatDate(currentPeriodEnd)} at
              </span>
              <span className="text-neutral-700 dark:text-neutral-300">
                {targetCycle === "monthly"
                  ? targetPlan.monthlyPriceGHS !== "custom"
                    ? formatCurrency(targetPlan.monthlyPriceGHS)
                    : "Custom"
                  : targetPlan.annualPriceGHS !== "custom"
                  ? formatCurrency(targetPlan.annualPriceGHS)
                  : "Custom"}
                {targetCycle === "monthly" ? "/mo" : "/yr"}
              </span>
            </div>
          )}
        </div>

        {action === "charge_now" && preview && preview.amountGHS > 0 && (
          <div className="flex items-start gap-2 rounded-lg border border-info-200 bg-info-50 p-3 text-xs text-info-800 dark:border-info-800 dark:bg-info-900/30 dark:text-info-200">
            <AtlasIcon
              name="info"
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
            <span>
              The charge is attempted with your saved payment method. If it
              fails, you can update payment before your current cycle ends.
            </span>
          </div>
        )}

        <div className="flex gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={onConfirm}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting
              ? "Processing"
              : action === "charge_now"
              ? wasTrialing
                ? "Start plan"
                : "Confirm and pay"
              : action === "defer"
              ? "Schedule change"
              : "Restart plan"}
          </Button>
        </div>
      </div>
    </AtlasModalShell>
  );
}