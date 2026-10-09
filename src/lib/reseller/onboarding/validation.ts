import { MAX_STORE_NAME_LENGTH } from "./constants";
import { evaluatePassword } from "./password";
import { checkSlug } from "./slug";
import type { OnboardingDraft, StepValidationResult } from "./types";

export function validateLoginStep(
  draft: OnboardingDraft,
): StepValidationResult {
  const errors: Record<string, string> = {};
  const email = draft.email.trim();
  if (!email) {
    errors.email = "Enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "That email does not look right.";
  }
  if (!draft.password) {
    errors.password = "Enter your password.";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAccountStep(
  draft: OnboardingDraft,
): StepValidationResult {
  if (draft.accountKind === "existing") return validateLoginStep(draft);
  const errors: Record<string, string> = {};
  if (!draft.fullName.trim()) {
    errors.fullName = "Tell us your name.";
  }
  const email = draft.email.trim();
  if (!email) {
    errors.email = "We need an email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "That email does not look right.";
  }
  const pw = evaluatePassword(draft.password);
  if (!pw.isValid) errors.password = "Password does not meet the rules yet.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStoreStep(
  draft: OnboardingDraft,
): StepValidationResult {
  const errors: Record<string, string> = {};
  const name = draft.storeName.trim();
  if (!name) {
    errors.storeName = "Give your shop a name.";
  } else if (name.length > MAX_STORE_NAME_LENGTH) {
    errors.storeName =
      "Keep it under " + String(MAX_STORE_NAME_LENGTH) + " characters.";
  }
  const slugOutcome = checkSlug(draft.slug);
  if (slugOutcome.status !== "available") {
    errors.slug = slugOutcome.message || "Pick a link for your shop.";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateReviewStep(
  draft: OnboardingDraft,
): StepValidationResult {
  return validateStoreStep(draft);
}