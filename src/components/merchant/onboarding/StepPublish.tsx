"use client";

import { MerchantOnboardingData } from "@/types/ecommerce";
import { templates, subscriptionPlans } from "@/lib/mock-ecommerce";

interface StepPublishProps {
  data: MerchantOnboardingData;
}

export default function StepPublish({ data }: StepPublishProps) {
  const storeSlug = data.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const storeUrl = `/ecommerce/${storeSlug || "your-store"}`;

  const selectedTemplate = templates.find((t) => t.id === data.templateId);
  const selectedPlan = subscriptionPlans.find((p) => p.id === data.planId);

  return (
    <div className="space-y-8 py-4 text-center">
      {/* Success icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
        <svg
          className="h-10 w-10 text-brand-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Your store is ready!
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
          Congratulations! You can now start selling online with your own ecommerce website.
        </p>
      </div>

      {/* Store URL card */}
      <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm font-medium text-neutral-500">Your store URL</p>
        <p className="mt-2 text-xl sm:text-2xl font-semibold text-brand-600 break-all">
          {storeUrl}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-center">
          <button
            type="button"
            className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
          >
            Open Storefront
          </button>
          <button
            type="button"
            className="rounded-lg border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="mx-auto max-w-lg rounded-xl border border-neutral-200 bg-white p-5 text-left dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
          Summary
        </h2>
        <dl className="mt-4 space-y-3">
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-neutral-500">Business name</dt>
            <dd className="text-sm font-medium text-neutral-900 dark:text-neutral-100 text-right">
              {data.businessName || "Your Store"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-neutral-500">Template</dt>
            <dd className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {selectedTemplate?.name || "Not selected"}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-neutral-500">Plan</dt>
            <dd className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {selectedPlan?.name || "Not selected"} (
              {data.billingCycle === "monthly" ? "Monthly" : "Annual"})
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
        You can now manage your products, orders, and store settings from your merchant dashboard.
      </div>
    </div>
  );
}