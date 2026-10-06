"use client";

import type { FormEvent, ReactNode } from "react";
import { WizardProgress } from "./WizardProgress";
import { OnboardingFooter } from "./OnboardingFooter";
import type { MerchantOnboardingStep } from "@/lib/merchant/onboarding/types";
import { MERCHANT_ONBOARDING_STEPS } from "@/lib/merchant/onboarding/types";

interface OnboardingShellProps {
  currentStep: MerchantOnboardingStep;
  stepIndexLabel: string;
  canContinue: boolean;
  continueLabel: string;
  isFinalStep: boolean;
  showBack: boolean;
  onSubmit: () => void;
  onBack: () => void;
  children: ReactNode;
  preview?: ReactNode;
}

export function OnboardingShell({
  currentStep,
  stepIndexLabel,
  canContinue,
  continueLabel,
  isFinalStep,
  showBack,
  onSubmit,
  onBack,
  children,
  preview,
}: OnboardingShellProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFinalStep) {
      if (canContinue) onSubmit();
    }
  };

  const hasPreview = Boolean(preview);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <a
        href="#onboarding-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Atlas Ecommerce
          </span>
          <span
            role="status"
            aria-live="polite"
            className="text-sm text-neutral-500"
          >
            {stepIndexLabel}
          </span>
        </div>
      </header>

      <main id="onboarding-main" className="mx-auto max-w-7xl px-4 py-8">
        <WizardProgress
          steps={MERCHANT_ONBOARDING_STEPS}
          currentStep={currentStep}
        />
        <div
          className={
            hasPreview
              ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start"
              : ""
          }
        >
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            {children}
            <OnboardingFooter
              showBack={showBack}
              isFinalStep={isFinalStep}
              canContinue={canContinue}
              continueLabel={continueLabel}
              onBack={onBack}
            />
          </form>
          {hasPreview && (
            <div className="lg:sticky lg:top-6">
              {preview}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}