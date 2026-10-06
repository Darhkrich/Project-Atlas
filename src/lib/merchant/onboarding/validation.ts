import type { MerchantOnboardingDraft } from "./types";
import { validateSlug } from "./slug";
import { MIN_PASSWORD_LENGTH } from "./constants";

export interface OnboardingStepValidity {
  valid: boolean;
  errors: string[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PHONE_DIGITS = 9;

function emailValid(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

function phoneValid(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= MIN_PHONE_DIGITS;
}

export function validateAccountStep(
  draft: MerchantOnboardingDraft,
  password: string
): OnboardingStepValidity {
  const errors: string[] = [];
  if (!draft.fullName.trim()) errors.push("Full name is required.");
  if (!emailValid(draft.email)) errors.push("Enter a valid email address.");
  if (!phoneValid(draft.phone)) errors.push("Enter a valid phone number.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(
      "Password must be at least " + MIN_PASSWORD_LENGTH + " characters."
    );
  }
  return { valid: errors.length === 0, errors };
}

export function validateBusinessStep(
  draft: MerchantOnboardingDraft
): OnboardingStepValidity {
  const errors: string[] = [];
  if (!draft.businessName.trim()) errors.push("Business name is required.");
  if (!draft.businessDescription.trim()) {
    errors.push("Add a short description of your business.");
  }
  if (!draft.businessCategory) errors.push("Choose a category.");
  const slugResult = validateSlug(draft.reservedSlug);
  if (!slugResult.ok) {
    if (slugResult.reason === "empty") {
      errors.push("Your store URL is required.");
    } else if (slugResult.reason === "reserved") {
      errors.push("That store URL is reserved. Try another.");
    } else if (slugResult.reason === "too-short") {
      errors.push("Your store URL is too short.");
    }
  }
  return { valid: errors.length === 0, errors };
}

export function validateStorefrontStep(
  draft: MerchantOnboardingDraft
): OnboardingStepValidity {
  const errors: string[] = [];
  if (!draft.templateId) errors.push("Choose a template.");
  if (!draft.branding.tagline.trim()) errors.push("Add a tagline.");
  return { valid: errors.length === 0, errors };
}

export function validatePlanStep(
  draft: MerchantOnboardingDraft
): OnboardingStepValidity {
  const errors: string[] = [];
  if (!draft.planId) errors.push("Choose a plan.");
  return { valid: errors.length === 0, errors };
}

export function validatePublishStep(): OnboardingStepValidity {
  return { valid: true, errors: [] };
}

export function validateAllSteps(
  draft: MerchantOnboardingDraft,
  password: string
): OnboardingStepValidity {
  const errors: string[] = [
    ...validateAccountStep(draft, password).errors,
    ...validateBusinessStep(draft).errors,
    ...validateStorefrontStep(draft).errors,
    ...validatePlanStep(draft).errors,
  ];
  return { valid: errors.length === 0, errors };
}