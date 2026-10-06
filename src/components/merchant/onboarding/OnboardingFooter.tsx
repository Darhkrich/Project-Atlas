"use client";

import { Button } from "@/components/atlas/button";

interface OnboardingFooterProps {
  showBack: boolean;
  isFinalStep: boolean;
  canContinue: boolean;
  continueLabel: string;
  onBack: () => void;
}

export function OnboardingFooter({
  showBack,
  isFinalStep,
  canContinue,
  continueLabel,
  onBack,
}: OnboardingFooterProps) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {showBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
      {!isFinalStep && (
        <Button type="submit" disabled={!canContinue}>
          {continueLabel}
        </Button>
      )}
    </div>
  );
}