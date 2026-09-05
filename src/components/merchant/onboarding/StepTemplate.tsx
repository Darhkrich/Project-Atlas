/* eslint-disable @next/next/no-img-element */
"use client";

import { MerchantOnboardingData } from "@/types/ecommerce";
import { templateMetadata } from "@/components/storefront/templates";

interface StepTemplateProps {
  data: MerchantOnboardingData;
  updateData: (d: Partial<MerchantOnboardingData>) => void;
}

export default function StepTemplate({ data, updateData }: StepTemplateProps) {
  const filteredTemplates = templateMetadata.filter(
    (template) => template.category === data.businessCategory,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Choose your storefront template
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Select a design for your{" "}
          <span className="font-medium capitalize">{data.businessCategory}</span>{" "}
          business. You can customize it later.
        </p>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            No templates available for this category yet. Please choose another category or continue with General Store.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const isSelected = data.templateId === template.id;
            return (
              <div
                key={template.id}
                className={`group overflow-hidden rounded-xl border-2 bg-white shadow-sm transition-all dark:bg-neutral-950 ${
                  isSelected
                    ? "border-brand-600 shadow-lg"
                    : "border-neutral-200 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:hover:border-neutral-700"
                }`}
              >
                <img
                  src={template.thumbnail}
                  alt={`${template.name} template`}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {template.description}
                  </p>
                  <ul className="mt-3 space-y-1">
                    {template.attributes.map((attr) => (
                      <li key={attr} className="flex items-center gap-2 text-sm text-neutral-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                        {attr}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => updateData({ templateId: template.id })}
                    className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      isSelected
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "border border-brand-800 text-brand-800 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-900/30"
                    }`}
                  >
                    {isSelected ? "Selected" : "Use this template"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}