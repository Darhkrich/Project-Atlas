/* eslint-disable react/no-unescaped-entities */
"use client";

import { MerchantOnboardingData, TemplateCategory } from "@/types/ecommerce";
import { templateCategories } from "@/lib/mock-ecommerce";

interface StepBusinessProps {
  data: MerchantOnboardingData;
  updateData: (d: Partial<MerchantOnboardingData>) => void;
}

const categoryIcons: Record<TemplateCategory, string> = {
  cosmetics: "💄",
  clothing: "👕",
  garden: "🌱",
  accessories: "👜",
  electronics: "📱",
  home: "🏠",
  food: "🍔",
  sports: "⚽",
  health: "💪",
  general: "🛍️",
};

export default function StepBusiness({ data, updateData }: StepBusinessProps) {
  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Tell us about your business
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          We'll recommend the perfect template for your products.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="businessName"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Business / Store name
          </label>
          <input
            id="businessName"
            type="text"
            value={data.businessName}
            onChange={(e) => updateData({ businessName: e.target.value })}
            placeholder="e.g., Glow Beauty Cosmetics"
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900"
            required
          />
        </div>

        <div>
          <label
            htmlFor="businessDescription"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Business description
          </label>
          <textarea
            id="businessDescription"
            value={data.businessDescription}
            onChange={(e) => updateData({ businessDescription: e.target.value })}
            rows={3}
            placeholder="Briefly describe what you sell..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900 resize-none"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            What type of products do you sell?
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {templateCategories.map((category) => {
              const isSelected = data.businessCategory === category.value;
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() =>
                    updateData({ businessCategory: category.value as TemplateCategory })
                  }
                  className={`group rounded-xl border-2 p-4 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                    isSelected
                      ? "border-brand-600 bg-brand-50 shadow-sm dark:border-brand-500 dark:bg-brand-900/20"
                      : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-neutral-600"
                  }`}
                >
                  <span className="block text-3xl mb-2">{categoryIcons[category.value]}</span>
                  <span
                    className={`block text-sm font-medium ${
                      isSelected
                        ? "text-brand-700 dark:text-brand-200"
                        : "text-neutral-900 dark:text-neutral-100"
                    }`}
                  >
                    {category.label}
                  </span>
                  {isSelected && (
                    <span className="mt-1 inline-block rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}