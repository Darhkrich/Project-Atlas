/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useCurrentReseller } from "@/lib/reseller/hooks/use-current-reseller";
import { INVITED_STEPS, SELF_SERVE_STEPS } from "./constants";
import { loginReseller } from "./login";
import { clearDraft, emptyDraft, saveDraft } from "./progress-mutations";
import { getOnboardingStore } from "./progress-store";
import { publishOnboarding } from "./publish";
import { generateSlug } from "./slug";
import {
  validateAccountStep,
  validateReviewStep,
  validateStoreStep,
} from "./validation";
import type {
  LoginResult,
  OnboardingDraft,
  OnboardingMode,
  OnboardingStep,
  PublishResult,
  StepValidationResult,
} from "./types";

export interface UseOnboardingResult {
  mode: OnboardingMode;
  steps: OnboardingStep[];
  step: OnboardingStep;
  stepIndex: number;
  draft: OnboardingDraft;
  errors: Record<string, string>;
  publishResult: PublishResult | null;
  loginResult: LoginResult | null;
  submitting: boolean;
  loggingIn: boolean;
  updateDraft: (patch: Partial<OnboardingDraft>) => void;
  next: () => void;
  back: () => void;
  submit: () => void;
  login: () => void;
}

function validateStep(
  step: OnboardingStep,
  draft: OnboardingDraft,
): StepValidationResult {
  if (step === "account") return validateAccountStep(draft);
  if (step === "store") return validateStoreStep(draft);
  return validateReviewStep(draft);
}

export function useOnboarding(mode: OnboardingMode): UseOnboardingResult {
  const reseller = useCurrentReseller();
  const resellerId = reseller?.id ?? "RS-001";

  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<OnboardingDraft>(() => emptyDraft(mode));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    const map = getOnboardingStore();
    const entries = Object.entries(map);
    const matching = entries.filter(([, d]) => d.mode === mode);
    if (matching.length > 0) {
      matching.sort((a, b) => (b[1].updatedAt ?? 0) - (a[1].updatedAt ?? 0));
      setDraft({ ...matching[0][1], mode });
    }
    setHydrated(true);
  }, [hydrated, mode]);

  useEffect(() => {
    if (!hydrated) return;
    const hasKey = draft.mode === "invited" || draft.email.trim().length > 0;
    if (!hasKey) return;
    saveDraft(draft, resellerId);
  }, [draft, resellerId, hydrated]);

  const baseSteps = mode === "invited" ? INVITED_STEPS : SELF_SERVE_STEPS;
  const steps: OnboardingStep[] =
    mode === "self_serve" && draft.accountKind === "existing"
      ? (["account"] as OnboardingStep[])
      : baseSteps;

  useEffect(() => {
    if (stepIndex >= steps.length) setStepIndex(steps.length - 1);
  }, [stepIndex, steps.length]);

  const updateDraft = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((prev) => {
      const next: OnboardingDraft = { ...prev, ...patch };
      if (
        patch.storeName !== undefined &&
        (prev.slug.length === 0 || prev.slug === generateSlug(prev.storeName))
      ) {
        next.slug = generateSlug(patch.storeName);
      }
      return next;
    });
    setErrors({});
    setLoginResult(null);
  }, []);

  const next = useCallback(() => {
    const current = steps[stepIndex];
    if (!current) return;
    const result = validateStep(current, draft);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }, [stepIndex, steps, draft]);

  const back = useCallback(() => {
    setErrors({});
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const submit = useCallback(() => {
    setSubmitting(true);
    const result = publishOnboarding({ draft, resellerId });
    setPublishResult(result);
    setSubmitting(false);
    if (result.success) {
      clearDraft(draft, resellerId);
    }
  }, [draft, resellerId]);

  const login = useCallback(() => {
    setLoggingIn(true);
    const validation = validateAccountStep(draft);
    if (!validation.valid) {
      setErrors(validation.errors);
      setLoggingIn(false);
      return;
    }
    const result = loginReseller(draft.email, draft.password);
    setLoginResult(result);
    setLoggingIn(false);
  }, [draft]);

  const safeIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const currentStep = steps[safeIndex] ?? steps[0];

  return {
    mode,
    steps,
    step: currentStep,
    stepIndex: safeIndex,
    draft,
    errors,
    publishResult,
    loginResult,
    submitting,
    loggingIn,
    updateDraft,
    next,
    back,
    submit,
    login,
  };
}