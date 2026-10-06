import type { MerchantTemplateCategory } from "@/types/merchant-storefront";

export type MerchantOnboardingStep =
  | "account"
  | "business"
  | "storefront"
  | "plan"
  | "publish";

export const MERCHANT_ONBOARDING_STEPS: MerchantOnboardingStep[] = [
  "account",
  "business",
  "storefront",
  "plan",
  "publish",
];

export const MERCHANT_ONBOARDING_STEP_LABELS: Record<
  MerchantOnboardingStep,
  string
> = {
  account: "Account",
  business: "Business",
  storefront: "Storefront",
  plan: "Plan",
  publish: "Publish",
};

export const MERCHANT_ONBOARDING_TOTAL_STEPS =
  MERCHANT_ONBOARDING_STEPS.length;

export interface MerchantOnboardingBranding {
  logo: string;
  primaryColor: string;
  accentColor: string;
  tagline: string;
  heroTitle: string;
  heroDescription: string;
}

export interface MerchantOnboardingDraft {
  draftId: string;
  merchantId: string;
  currentStep: MerchantOnboardingStep;
  completedSteps: MerchantOnboardingStep[];
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  businessDescription: string;
  businessCategory: MerchantTemplateCategory;
  templateId: string;
  branding: MerchantOnboardingBranding;
  planId: string;
  billingCycle: "monthly" | "annual";
  reservedSlug: string;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_BRANDING: MerchantOnboardingBranding = {
  logo: "",
  primaryColor: "#4d8e44",
  accentColor: "#c89c1e",
  tagline: "",
  heroTitle: "",
  heroDescription: "",
};

export function createEmptyDraft(): MerchantOnboardingDraft {
  const now = Date.now();
  const id = crypto.randomUUID();
  return {
    draftId: id,
    merchantId: "MER-" + id.slice(0, 8).toUpperCase(),
    currentStep: "account",
    completedSteps: [],
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    businessDescription: "",
    businessCategory: "general",
    templateId: "",
    branding: { ...DEFAULT_BRANDING },
    planId: "",
    billingCycle: "monthly",
    reservedSlug: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function stepIndex(step: MerchantOnboardingStep): number {
  return MERCHANT_ONBOARDING_STEPS.indexOf(step);
}

export function nextStep(
  step: MerchantOnboardingStep
): MerchantOnboardingStep | null {
  const i = stepIndex(step);
  if (i < 0 || i >= MERCHANT_ONBOARDING_STEPS.length - 1) return null;
  return MERCHANT_ONBOARDING_STEPS[i + 1];
}

export function previousStep(
  step: MerchantOnboardingStep
): MerchantOnboardingStep | null {
  const i = stepIndex(step);
  if (i <= 0) return null;
  return MERCHANT_ONBOARDING_STEPS[i - 1];
}