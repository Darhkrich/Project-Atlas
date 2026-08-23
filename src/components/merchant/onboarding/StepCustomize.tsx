"use client";

import { MerchantOnboardingData } from "@/types/ecommerce";

interface StepCustomizeProps {
  data: MerchantOnboardingData;
  updateCustomization: (
    newCustom: Partial<MerchantOnboardingData["customization"]>
  ) => void;
}

const brandColorOptions = [
  "#4d8e44", // Atlas green
  "#166e59", // Teal
  "#c89c1e", // Amber
  "#c56151", // Warm red
  "#4089bb", // Blue
  "#6b6963", // Gray
  "#8b5cf6", // Violet
  "#d946ef", // Pink
];

const accentColorOptions = [
  "#c89c1e",
  "#dfb429",
  "#ffa000",
  "#e69000",
  "#166e59",
  "#4089bb",
  "#c56151",
  "#8b5cf6",
];

export default function StepCustomize({ data, updateCustomization }: StepCustomizeProps) {
  const { customization } = data;

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Customize your storefront
        </h1>
        <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Make this template your own. Changes update the live preview instantly.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Customization Form */}
        <div className="space-y-6">
          {/* Logo upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Store logo
            </label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
                <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <button
                type="button"
                className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              >
                Upload Logo
              </button>
            </div>
          </div>

          {/* Store name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Store name
            </label>
            <input
              type="text"
              value={data.businessName}
              onChange={(e) => updateCustomization({ heroHeadline: e.target.value })}
              placeholder="Your store name"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900"
            />
          </div>

          {/* Hero headline */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Hero headline
            </label>
            <input
              type="text"
              value={customization.heroHeadline}
              onChange={(e) => updateCustomization({ heroHeadline: e.target.value })}
              placeholder="e.g., Welcome to our store"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900"
            />
          </div>

          {/* Hero description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Hero description
            </label>
            <textarea
              value={customization.heroDescription}
              onChange={(e) => updateCustomization({ heroDescription: e.target.value })}
              rows={2}
              placeholder="Brief welcome message for visitors"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900 resize-none"
            />
          </div>

          {/* About text */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              About text
            </label>
            <textarea
              value={customization.aboutText}
              onChange={(e) => updateCustomization({ aboutText: e.target.value })}
              rows={3}
              placeholder="Tell customers about your business"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900 resize-none"
            />
          </div>

          {/* Contact email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Contact email
            </label>
            <input
              type="email"
              value={customization.contactEmail}
              onChange={(e) => updateCustomization({ contactEmail: e.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:ring-brand-900"
            />
          </div>

          {/* Brand color */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Brand color
            </label>
            <div className="flex flex-wrap gap-3">
              {brandColorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateCustomization({ brandColor: color })}
                  className={`h-9 w-9 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${
                    customization.brandColor === color
                      ? "border-neutral-900 scale-110 dark:border-white"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select brand color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Accent color */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Accent color
            </label>
            <div className="flex flex-wrap gap-3">
              {accentColorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateCustomization({ accentColor: color })}
                  className={`h-8 w-8 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${
                    customization.accentColor === color
                      ? "border-neutral-900 scale-110 dark:border-white"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select accent color ${color}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="mb-4 text-sm font-medium text-neutral-500">Storefront Preview</p>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-md dark:bg-neutral-950">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-neutral-500 truncate">
                {data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.atlas.com
              </span>
            </div>

            {/* Hero */}
            <div style={{ backgroundColor: customization.brandColor }} className="px-4 py-8 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {data.businessName || "Your Store"}
              </h2>
              <p className="mt-1 text-sm text-white/90">
                {customization.heroHeadline || "Hero headline"}
              </p>
              <p className="mt-1 text-xs text-white/80 max-w-xs mx-auto">
                {customization.heroDescription || "Hero description goes here."}
              </p>
              <button
                className="mt-4 rounded-md px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: customization.accentColor }}
              >
                Shop Now
              </button>
            </div>

            {/* Products placeholder grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="aspect-square rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-2.5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div
                      className="h-2 w-1/2 rounded"
                      style={{ backgroundColor: customization.accentColor }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="px-4 pb-4">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                About Us
              </h3>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                {customization.aboutText || "Your about text will appear here."}
              </p>
            </div>

            {/* Contact */}
            {customization.contactEmail && (
              <div className="px-4 pb-4">
                <p className="text-xs text-neutral-500">
                  Contact: <span className="text-neutral-700 dark:text-neutral-300">{customization.contactEmail}</span>
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-center">
              <p className="text-xs text-neutral-500">Powered by Atlas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}