"use client";

import { MerchantOnboardingData } from "@/types/ecommerce";
import { subscriptionPlans, type PlanCode } from "@/config/subscription-plans";

interface StepSubscriptionProps {
  data: MerchantOnboardingData;
  updateData: (d: Partial<MerchantOnboardingData>) => void;
}

export default function StepSubscription({ data, updateData }: StepSubscriptionProps) {
  const isAnnual = data.billingCycle === "annual";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Choose your plan
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Select the package that fits your business. You can upgrade anytime.
        </p>
      </div>

      {/* Billing cycle toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Billing cycle
        </span>
        <div className="flex rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700">
          <button
            type="button"
            onClick={() => updateData({ billingCycle: "monthly" })}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              !isAnnual
                ? "bg-brand-600 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => updateData({ billingCycle: "annual" })}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
              isAnnual
                ? "bg-brand-600 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            Annual
            <span className={`text-xs font-semibold ${isAnnual ? "text-brand-100" : "text-brand-600"}`}>
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {subscriptionPlans.map((plan) => {
          const isSelected = data.planId === plan.code;
          const isPopular = plan.code === "pro";
          const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
          const period = isAnnual ? "/year" : "/month";

          return (
            <div
              key={plan.code}
              className={`relative rounded-2xl border-2 p-5 transition-all duration-200 ${
                isSelected
                  ? "border-brand-600 bg-brand-50 shadow-lg dark:border-brand-500 dark:bg-brand-900/20"
                  : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {plan.name}
                </h3>
                {isSelected && (
                  <span className="rounded-full bg-brand-600 px-2 py-1 text-xs font-semibold text-white">
                    Selected
                  </span>
                )}
              </div>

              <div className="mt-3">
                <p className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
                  {price}
                </p>
                <p className="text-sm text-neutral-500">{period}</p>
              </div>

              <ul className="mt-5 space-y-2">
                <li className="flex items-start text-sm text-neutral-600 dark:text-neutral-400">
                  <svg className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {plan.maxProducts === Infinity ? "Unlimited products" : `Up to ${plan.maxProducts} products`}
                </li>
                <li className="flex items-start text-sm text-neutral-600 dark:text-neutral-400">
                  <svg className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {plan.themes.length} theme{plan.themes.length !== 1 ? "s" : ""}
                </li>
                <li className="flex items-start text-sm text-neutral-600 dark:text-neutral-400">
                  <svg className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {plan.paymentMethods.length} payment method{plan.paymentMethods.length !== 1 ? "s" : ""}
                </li>
                <li className="flex items-start text-sm text-neutral-600 dark:text-neutral-400">
                  <svg className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {plan.supportLevel}
                </li>
                <li className="flex items-start text-sm text-neutral-600 dark:text-neutral-400">
                  <svg className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Custom domain: {plan.customDomain ? "Yes" : "No"}
                </li>
              </ul>

              <button
                type="button"
                onClick={() => updateData({ planId: plan.code as PlanCode })}
                className={`mt-5 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                  isSelected
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {isSelected ? "Selected Plan" : `Select ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}