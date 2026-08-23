/* eslint-disable react/no-unescaped-entities */
"use client";

import { MerchantOnboardingData } from "@/types/ecommerce";
import { templates } from "@/lib/mock-ecommerce";

interface StepTemplateProps {
  data: MerchantOnboardingData;
  updateData: (d: Partial<MerchantOnboardingData>) => void;
}

// Mini storefront preview component
function TemplatePreview({ template }: { template: (typeof templates)[0] }) {
  const { brandColor, accentColor } = template.defaultSettings;
  return (
    <div className="w-full h-full overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      {/* Hero section */}
      <div
        className="h-1/3 w-full flex items-center justify-center relative"
        style={{ backgroundColor: brandColor }}
      >
        <div className="text-center">
          <div className="h-2 w-16 bg-white/80 rounded mb-1 mx-auto" />
          <div className="h-1.5 w-24 bg-white/60 rounded mx-auto" />
        </div>
        <span
          className="absolute bottom-1 right-1 h-3 w-3 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      {/* Product grid placeholder */}
      <div className="p-2 grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <div className="aspect-square rounded-sm bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-1.5 w-3/4 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-1.5 w-1/2 rounded-sm" style={{ backgroundColor: accentColor }} />
          </div>
        ))}
      </div>
      {/* Footer placeholder */}
      <div className="px-2 pb-2">
        <div className="h-1.5 w-full rounded-sm bg-neutral-200 dark:bg-neutral-700" />
      </div>
    </div>
  );
}

export default function StepTemplate({ data, updateData }: StepTemplateProps) {
  const filteredTemplates = templates.filter(
    (template) => template.category === data.businessCategory
  );

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Choose your storefront template
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Select a design for your{" "}
          <span className="font-medium capitalize">{data.businessCategory}</span> business.
          You can customize it next.
        </p>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
            <svg className="h-6 w-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm12 0a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            No templates available yet
          </h3>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            We're working on designs for this category. Please choose another category or continue with a general template.
          </p>
          <button
            type="button"
            onClick={() => updateData({ businessCategory: "general" })}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Browse General Templates
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredTemplates.map((template) => {
            const isSelected = data.templateId === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => updateData({ templateId: template.id })}
                className={`group relative overflow-hidden rounded-xl border-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                  isSelected
                    ? "border-brand-600 ring-2 ring-brand-500 shadow-lg"
                    : "border-neutral-200 hover:border-neutral-300 hover:shadow-md dark:border-neutral-700 dark:hover:border-neutral-600"
                }`}
              >
                <div className="aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800">
                  <TemplatePreview template={template} />
                  {isSelected && (
                    <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Selected
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {template.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}