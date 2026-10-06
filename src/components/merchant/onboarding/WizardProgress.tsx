"use client";

import { EM_DASH } from "@/lib/merchant/onboarding/constants";
import type { MerchantOnboardingStep } from "@/lib/merchant/onboarding/types";
import { MERCHANT_ONBOARDING_STEP_LABELS } from "@/lib/merchant/onboarding/types";

interface WizardProgressProps {
  steps: MerchantOnboardingStep[];
  currentStep: MerchantOnboardingStep;
}

export function WizardProgress({
  steps,
  currentStep,
}: WizardProgressProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <ol
      aria-label="Onboarding progress"
      className="mb-8 flex flex-wrap items-center gap-2"
    >
      {steps.map((step, idx) => {
        const isCurrent = idx === currentIndex;
        const isComplete = idx < currentIndex;
        const label = MERCHANT_ONBOARDING_STEP_LABELS[step];

        return (
          <li key={step} className="flex items-center">
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium " +
                (isComplete
                  ? "bg-brand-500 text-white"
                  : isCurrent
                  ? "bg-brand-600 text-white"
                  : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300")
              }
            >
              {idx + 1}
            </span>
            <span
              className={
                "ml-2 text-sm " +
                (isCurrent
                  ? "font-medium text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500")
              }
            >
              {label}
            </span>
            {idx < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="mx-2 text-neutral-300 dark:text-neutral-600"
              >
                {EM_DASH}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}