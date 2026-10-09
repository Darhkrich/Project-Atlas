import type { ResellerStorefrontTemplateId } from "@/types/reseller-storefront";

export type OnboardingMode = "self_serve" | "invited";

export type OnboardingStep = "account" | "store" | "review";

export type AccountKind = "new" | "existing";

export interface OnboardingDraft {
  mode: OnboardingMode;
  accountKind: AccountKind;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  storeName: string;
  slug: string;
  primaryColor: string;
  accentColor: string;
  logo: string;
  templateId: ResellerStorefrontTemplateId;
  updatedAt: number;
}

export interface PublishInput {
  draft: OnboardingDraft;
  resellerId: string;
}

export interface PublishResult {
  success: boolean;
  errors: Record<string, string>;
  slug: string | null;
  storefrontUrl: string | null;
}

export interface LoginResult {
  success: boolean;
  error: string | null;
}

export interface StepValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}