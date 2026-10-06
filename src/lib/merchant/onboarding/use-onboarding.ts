"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getOnboardingDraft,
  subscribeToOnboardingDraft,
} from "./progress-store";
import {
  advanceStep,
  gotoStep,
  retreatStep,
  setDraftBrandingField,
  setDraftField,
} from "./progress-mutations";
import {
  validateBusinessStep,
  validatePlanStep,
  validatePublishStep,
  validateStorefrontStep,
  type OnboardingStepValidity,
} from "./validation";
import type {
  MerchantOnboardingBranding,
  MerchantOnboardingDraft,
  MerchantOnboardingStep,
} from "./types";

export interface OnboardingActions {
  setField: <K extends keyof MerchantOnboardingDraft>(
    key: K,
    value: MerchantOnboardingDraft[K]
  ) => void;
  setBranding: (key: keyof MerchantOnboardingBranding, value: string) => void;
  next: () => void;
  back: () => void;
  goto: (step: MerchantOnboardingStep) => void;
}

export interface UseOnboardingResult {
  draft: MerchantOnboardingDraft | null;
  validity: Record<MerchantOnboardingStep, OnboardingStepValidity>;
  actions: OnboardingActions;
}

const EMPTY_VALIDITY: Record<MerchantOnboardingStep, OnboardingStepValidity> = {
  account: { valid: false, errors: [] },
  business: { valid: false, errors: [] },
  storefront: { valid: false, errors: [] },
  plan: { valid: false, errors: [] },
  publish: { valid: true, errors: [] },
};

export function useOnboarding(): UseOnboardingResult {
  const draft = useSyncExternalStore(
    subscribeToOnboardingDraft,
    getOnboardingDraft,
    () => null
  );

  const validity = useMemo(() => {
    if (!draft) return EMPTY_VALIDITY;
    return {
      account: { valid: false, errors: [] },
      business: validateBusinessStep(draft),
      storefront: validateStorefrontStep(draft),
      plan: validatePlanStep(draft),
      publish: validatePublishStep(),
    };
  }, [draft]);

  return {
    draft,
    validity,
    actions: {
      setField: setDraftField,
      setBranding: setDraftBrandingField,
      next: advanceStep,
      back: retreatStep,
      goto: gotoStep,
    },
  };
}