"use client";

import { useState } from "react";
import { MerchantOnboardingData } from "@/types/ecommerce";
import StepAccount from "@/components/merchant/onboarding/StepAccount";
import StepBusiness from "@/components/merchant/onboarding/StepBusiness";
import StepTemplate from "@/components/merchant/onboarding/StepTemplate";
import StepCustomize from "@/components/merchant/onboarding/StepCustomize";
import StepSubscription from "@/components/merchant/onboarding/StepSubscription";
import StepPublish from "@/components/merchant/onboarding/StepPublish";

const steps = [
  { label: "Account", description: "Create your merchant account" },
  { label: "Business", description: "Tell us about your business" },
  { label: "Template", description: "Choose a storefront design" },
  { label: "Customize", description: "Make it your own" },
  { label: "Plan", description: "Select a subscription" },
  { label: "Publish", description: "Go live" },
];

export default function MerchantOnboardingPage() {
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

  const updateCustomization = (newCustom: Partial<MerchantOnboardingData["customization"]>) =>
    setData((prev) => ({
      ...prev,
      customization: { ...prev.customization, ...newCustom },
    }));

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 lg:flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col bg-brand-950 dark:bg-neutral-950 p-8 xl:p-10 fixed inset-y-0 left-0">
        <div className="flex items-center gap-2 text-white">
          <span className="text-2xl font-bold">Atlas</span>
          <span className="text-sm text-neutral-400">Ecommerce</span>
        </div>
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white">
            Start your online store
          </h2>
          <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
            Join thousands of business owners who built their website with Atlas.
          </p>
        </div>
        <nav className="mt-10 space-y-6">
          {steps.map((step, idx) => (
            <div key={step.label} className="flex items-start">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  idx < currentStep
                    ? "bg-brand-500 text-white"
                    : idx === currentStep
                    ? "bg-brand-400 text-brand-950 ring-2 ring-brand-300"
                    : "bg-neutral-800 text-neutral-400"
                }`}
              >
                {idx + 1}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    idx === currentStep ? "text-white" : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-auto pt-10">
          <div className="rounded-xl bg-neutral-900 p-4">
            <p className="text-sm text-neutral-300">Need help?</p>
            <a
              href="/support"
              className="mt-1 inline-block text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              Contact Atlas Support
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-80 xl:ml-96 flex flex-col min-h-screen">
        {/* Mobile header with progress */}
        <header className="lg:hidden sticky top-0 z-20 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-500">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-semibold text-brand-600">
                {steps[currentStep].label}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        {/* Step content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-12 pb-28 lg:pb-12">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              {currentStep === 0 && <StepAccount data={data} updateData={updateData} />}
              {currentStep === 1 && <StepBusiness data={data} updateData={updateData} />}
              {currentStep === 2 && <StepTemplate data={data} updateData={updateData} />}
              {currentStep === 3 && (
                <StepCustomize data={data} updateCustomization={updateCustomization} />
              )}
              {currentStep === 4 && <StepSubscription data={data} updateData={updateData} />}
              {currentStep === 5 && <StepPublish data={data} />}
            </div>
          </div>
        </main>

        {/* Sticky bottom navigation (mobile fixed, desktop static) */}
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-t border-neutral-200 dark:border-neutral-800 lg:static lg:bg-transparent lg:border-0 lg:backdrop-blur-none lg:px-10 lg:pb-8">
          <div className="max-w-3xl mx-auto px-4 py-4 lg:px-0 lg:py-0 flex justify-between gap-4">
            <button
              onClick={goBack}
              disabled={currentStep === 0}
              className="flex-1 lg:flex-none rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              Back
            </button>
            {currentStep < steps.length - 1 ? (
              <button
                onClick={goNext}
                className="flex-1 lg:flex-none rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={goNext}
                className="flex-1 lg:flex-none rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}