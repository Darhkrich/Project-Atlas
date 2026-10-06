import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import type { MerchantOnboardingDraft } from "./types";
import { DEFAULT_TEMPLATE_ID } from "./templates";
import { validateAllSteps } from "./validation";
import { getPlanByCode } from "@/lib/domains/subscriptions";

export interface PublishInput {
  draft: MerchantOnboardingDraft;
  password: string;
  currentUserEmail: string | null;
}

export interface PublishPlan {
  ok: boolean;
  errors: string[];
  storefrontConfig: MerchantStorefrontConfig | null;
  planCode: string | null;
  shouldRegister: boolean;
  registerEmail: string;
  registerPassword: string;
  ownerEmail: string;
}

const FALLBACK_OWNER_EMAIL = "";

export function buildPublishPlan(input: PublishInput): PublishPlan {
  const { draft, password, currentUserEmail } = input;

  const validation = validateAllSteps(draft, password);
  if (!validation.valid) {
    return {
      ok: false,
      errors: validation.errors,
      storefrontConfig: null,
      planCode: null,
      shouldRegister: false,
      registerEmail: draft.email,
      registerPassword: "",
      ownerEmail: currentUserEmail ?? FALLBACK_OWNER_EMAIL,
    };
  }

  const plan = getPlanByCode(draft.planId);
  if (!plan) {
    return {
      ok: false,
      errors: [
        "The selected plan is no longer available. Pick a plan and try again.",
      ],
      storefrontConfig: null,
      planCode: null,
      shouldRegister: false,
      registerEmail: draft.email,
      registerPassword: "",
      ownerEmail: currentUserEmail ?? FALLBACK_OWNER_EMAIL,
    };
  }

  const storefrontId = crypto.randomUUID();

const chosenTheme = plan.themes.includes("airy")
    ? "airy"
    : plan.themes[0];
  const theme = (chosenTheme ?? "studio") as MerchantStorefrontConfig["theme"];

  const storefrontConfig: MerchantStorefrontConfig = {
    storefrontId,
    storeName: draft.businessName,
    slug: draft.reservedSlug,
    logo: draft.branding.logo || undefined,
    primaryColor: draft.branding.primaryColor,
    accentColor: draft.branding.accentColor,
    tagline: draft.branding.tagline,
    description: draft.businessDescription,
    heroTitle: draft.branding.heroTitle || draft.businessName,
    heroDescription:
      draft.branding.heroDescription || draft.branding.tagline,
    theme,
    templateId: draft.templateId || DEFAULT_TEMPLATE_ID,
    templateCategory: draft.businessCategory,
    announcement: "",
    contactEmail: draft.email,
    contactPhone: draft.phone,
    whatsapp: draft.phone,
    address: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      tiktok: "",
      twitter: "",
    },
    showAnnouncement: false,
    showTrustSection: true,
    showFeaturedProducts: true,
    status: "live",
    paymentMethodIds: plan.paymentMethods as string[],
    codEnabled: false,
    planId: plan.code,
  };

  return {
    ok: true,
    errors: [],
    storefrontConfig,
    planCode: plan.code,
    shouldRegister: currentUserEmail === null,
    registerEmail: draft.email,
    registerPassword: password,
    ownerEmail: currentUserEmail ?? draft.email,
  };
}