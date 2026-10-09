import {
  removeOnboardingDraft,
  setOnboardingDraft,
} from "./progress-store";
import type { OnboardingDraft, OnboardingMode } from "./types";

export function draftKeyFor(
  draft: OnboardingDraft,
  resellerId: string,
): string {
  if (draft.mode === "invited") return "reseller:" + resellerId;
  const email = draft.email.trim().toLowerCase();
  if (!email) return "reseller:" + resellerId;
  return "email:" + email;
}

export function saveDraft(draft: OnboardingDraft, resellerId: string): void {
  setOnboardingDraft(draftKeyFor(draft, resellerId), {
    ...draft,
    updatedAt: Date.now(),
  });
}

export function clearDraft(draft: OnboardingDraft, resellerId: string): void {
  removeOnboardingDraft(draftKeyFor(draft, resellerId));
}

export function emptyDraft(mode: OnboardingMode): OnboardingDraft {
  return {
    mode,
    accountKind: "new",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    storeName: "",
    slug: "",
    primaryColor: "#064E3B",
    accentColor: "#22C55E",
    logo: "",
    templateId: "modern",
    updatedAt: 0,
  };
}