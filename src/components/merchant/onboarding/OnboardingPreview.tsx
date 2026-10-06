"use client";

import { useState } from "react";
import { MerchantStorefrontPreview } from "@/components/merchant/storefront/merchant-storefront-preview";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import type { MerchantOnboardingDraft } from "@/lib/merchant/onboarding/types";
import { DEFAULT_TEMPLATE_ID } from "@/lib/merchant/onboarding/templates";

type PreviewMode = "desktop" | "mobile";

interface OnboardingPreviewProps {
  draft: MerchantOnboardingDraft | null;
}

function draftToConfig(
  draft: MerchantOnboardingDraft | null
): MerchantStorefrontConfig {
  if (!draft) {
    return {
      storefrontId: "preview",
      storeName: "Your store",
      slug: "your-store",
      primaryColor: "#4d8e44",
      accentColor: "#c89c1e",
      tagline: "Quality products, great prices.",
      description: "Discover quality products at great prices.",
      heroTitle: "Welcome to your store",
      heroDescription: "Browse our collection and find something you love.",
      theme: "airy",
      templateId: DEFAULT_TEMPLATE_ID,
      templateCategory: "general",
      announcement: "",
      contactEmail: "",
      contactPhone: "",
      whatsapp: "",
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
      status: "draft",
      paymentMethodIds: ["momo"],
      codEnabled: false,
    };
  }

  return {
    storefrontId: draft.merchantId,
    storeName: draft.businessName || "Your store",
    slug: draft.reservedSlug || "your-store",
    logo: draft.branding.logo || undefined,
    primaryColor: draft.branding.primaryColor,
    accentColor: draft.branding.accentColor,
    tagline: draft.branding.tagline || "Your tagline",
    description: draft.businessDescription || "",
    heroTitle: draft.branding.heroTitle || draft.businessName || "Welcome",
    heroDescription:
      draft.branding.heroDescription || draft.branding.tagline || "",
    theme: "airy",
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
    status: "draft",
    paymentMethodIds: ["momo"],
    codEnabled: false,
    planId: draft.planId || undefined,
  };
}

export function OnboardingPreview({ draft }: OnboardingPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("desktop");
  const config = draftToConfig(draft);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Live preview
          </p>
          <p className="text-xs text-neutral-500">
            {draft
              ? "Updates as you type"
              : "Fill in the form to see your store"}
          </p>
        </div>
        <div
          role="group"
          aria-label="Preview device"
          className="flex rounded-lg border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <button
            type="button"
            onClick={() => setMode("desktop")}
            aria-pressed={mode === "desktop"}
            className={
              "rounded-md px-3 py-1.5 text-xs font-semibold transition " +
              (mode === "desktop"
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300")
            }
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setMode("mobile")}
            aria-pressed={mode === "mobile"}
            className={
              "rounded-md px-3 py-1.5 text-xs font-semibold transition " +
              (mode === "mobile"
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300")
            }
          >
            Mobile
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="p-4">
          <MerchantStorefrontPreview store={config} mode={mode} />
        </div>
      </div>
    </div>
  );
}