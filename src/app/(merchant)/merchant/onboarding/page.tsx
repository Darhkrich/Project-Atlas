/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MerchantOnboardingData } from "@/types/ecommerce";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useSubscription } from "@/contexts/subscription-context";
import { getPlanByCode } from "@/config/subscription-plans";
import type { MerchantStorefrontConfig, MerchantStorefrontTheme, MerchantTemplateCategory } from "@/types/merchant-storefront";
import { useAuth } from "@/contexts/auth-context";
import StepAccount from "@/components/merchant/onboarding/StepAccount";
import StepBusiness from "@/components/merchant/onboarding/StepBusiness";
import StepTemplate from "@/components/merchant/onboarding/StepTemplate";
import StepSubscription from "@/components/merchant/onboarding/StepSubscription";
import StepPublish from "@/components/merchant/onboarding/StepPublish";

const steps = ["Account", "Business", "Template", "Plan", "Publish"];

export default function MerchantOnboardingPage() {
  const router = useRouter();
  const { updateStorefrontConfig } = useStorefrontConfig();
  const { setCurrentPlan } = useSubscription();
  const { addRole, register, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<MerchantOnboardingData>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    businessDescription: "",
    businessCategory: "general",
    templateId: "",
    customization: {
      logoUrl: "",
      brandColor: "#4d8e44",
      accentColor: "#c89c1e",
      heroHeadline: "",
      heroDescription: "",
      aboutText: "",
      contactEmail: "",
      contactPhone: "",
      whatsappNumber: "",
      address: "",
      socialLinks: {
        facebook: "",
        instagram: "",
        tiktok: "",
      },
      announcement: "",
    },
    planId: "",
    billingCycle: "monthly",
  });

  const updateData = (newData: Partial<MerchantOnboardingData>) =>
    setData((prev) => ({ ...prev, ...newData }));

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handlePublish = () => {
    const slug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const plan = getPlanByCode(data.planId as any) || getPlanByCode("growth");
    const theme = (plan.themes.includes("modern") ? "modern" : plan.themes[0] || "minimal") as MerchantStorefrontTheme;

    const storeConfig: MerchantStorefrontConfig = {
      storeName: data.businessName || "My Store",
      slug,
      primaryColor: data.customization.brandColor,
      accentColor: data.customization.accentColor,
      tagline: data.businessDescription,
      description: data.businessDescription,
      heroTitle: data.customization.heroHeadline || data.businessName,
      heroDescription: data.customization.heroDescription || "",
      logo: data.customization.logoUrl || undefined,
      theme,
      templateId: data.templateId,
      templateCategory: data.businessCategory as MerchantTemplateCategory,
      announcement: data.customization.announcement || "",
      contactEmail: data.customization.contactEmail,
      contactPhone: data.customization.contactPhone,
      whatsapp: data.customization.whatsappNumber,
      address: data.customization.address,
      socialLinks: {
        facebook: data.customization.socialLinks.facebook,
        instagram: data.customization.socialLinks.instagram,
        tiktok: data.customization.socialLinks.tiktok,
        twitter: "",
      },
      showAnnouncement: false,
      showTrustSection: true,
      showFeaturedProducts: true,
      status: "live",
      paymentMethodIds: plan.paymentMethods,
      codEnabled: false,
      planId: data.planId,
    };

    updateStorefrontConfig(storeConfig);
    setCurrentPlan(data.planId as any);

    if (user) {
      addRole(user.email, "merchant");
    } else if (data.email && data.password) {
      register(data.email, data.password, "merchant");
    }

    router.push("/merchant/dashboard");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Atlas Ecommerce
          </span>
          <span className="text-sm text-neutral-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  idx < currentStep
                    ? "bg-brand-500 text-white"
                    : idx === currentStep
                    ? "bg-brand-600 text-white"
                    : "bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {idx + 1}
              </span>
              <span
                className={`ml-2 text-sm ${
                  idx === currentStep
                    ? "font-medium text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500"
                }`}
              >
                {step}
              </span>
              {idx < steps.length - 1 && <span className="mx-2 text-neutral-300">—</span>}
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {currentStep === 0 && <StepAccount data={data} updateData={updateData} />}
          {currentStep === 1 && <StepBusiness data={data} updateData={updateData} />}
          {currentStep === 2 && <StepTemplate data={data} updateData={updateData} />}
          {currentStep === 3 && <StepSubscription data={data} updateData={updateData} />}
          {currentStep === 4 && <StepPublish data={data} onPublish={handlePublish} />}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={goBack}
            disabled={currentStep === 0}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Back
          </button>
          {currentStep < steps.length - 1 && (
            <button
              onClick={goNext}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Continue
            </button>
          )}
        </div>
      </main>
    </div>
  );
}