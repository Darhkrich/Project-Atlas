import {
  createEmptyDraft,
  nextStep,
  previousStep,
  type MerchantOnboardingBranding,
  type MerchantOnboardingDraft,
  type MerchantOnboardingStep,
} from "./types";
import {
  getOnboardingDraft,
  patchOnboardingDraft,
  setOnboardingDraft,
} from "./progress-store";

export interface StartDraftSeed {
  businessName?: string;
  reservedSlug?: string;
}

export function startOnboardingDraft(
  seed: StartDraftSeed = {}
): MerchantOnboardingDraft {
  const existing = getOnboardingDraft();

  if (existing) {
    const patch: Partial<MerchantOnboardingDraft> = {};
    if (seed.businessName !== undefined) patch.businessName = seed.businessName;
    if (seed.reservedSlug !== undefined) patch.reservedSlug = seed.reservedSlug;
    if (Object.keys(patch).length > 0) patchOnboardingDraft(patch);
    return { ...existing, ...patch };
  }

  const draft = createEmptyDraft();
  if (seed.businessName) draft.businessName = seed.businessName;
  if (seed.reservedSlug) draft.reservedSlug = seed.reservedSlug;
  setOnboardingDraft(draft);
  return draft;
}

export function resetOnboardingDraft(): void {
  setOnboardingDraft(null);
}

export function setDraftField<K extends keyof MerchantOnboardingDraft>(
  key: K,
  value: MerchantOnboardingDraft[K]
): void {
  patchOnboardingDraft({ [key]: value } as Partial<MerchantOnboardingDraft>);
}

export function setDraftBrandingField(
  key: keyof MerchantOnboardingBranding,
  value: string
): void {
  const draft = getOnboardingDraft();
  if (!draft) return;
  patchOnboardingDraft({
    branding: { ...draft.branding, [key]: value },
  });
}

export function advanceStep(): void {
  const draft = getOnboardingDraft();
  if (!draft) return;
  const target = nextStep(draft.currentStep);
  if (!target) return;
  const completed = draft.completedSteps.includes(draft.currentStep)
    ? draft.completedSteps
    : [...draft.completedSteps, draft.currentStep];
  patchOnboardingDraft({
    currentStep: target,
    completedSteps: completed,
  });
}

export function retreatStep(): void {
  const draft = getOnboardingDraft();
  if (!draft) return;
  const target = previousStep(draft.currentStep);
  if (!target) return;
  patchOnboardingDraft({ currentStep: target });
}

export function gotoStep(step: MerchantOnboardingStep): void {
  const draft = getOnboardingDraft();
  if (!draft) return;
  patchOnboardingDraft({ currentStep: step });
}