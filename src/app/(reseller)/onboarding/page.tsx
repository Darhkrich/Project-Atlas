"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStorefront } from "@/contexts/storefront-context";
import { defaultStorefrontConfig } from "@/lib/storefront/defaults";
import { generateSlug, getBrandingStyle, getThemeClasses } from "@/lib/storefront/utils";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import type { StorefrontTemplateId } from "@/lib/storefront/types";

const templateOptions: {
  id: StorefrontTemplateId;
  label: string;
  description: string;
  icon: "store" | "briefcase" | "grid";
}[] = [
  { id: "template1", label: "Classic", description: "Professional corporate layout with how-it-works section.", icon: "store" },
  { id: "template2", label: "Modern", description: "Spacious and modern with promo banner.", icon: "briefcase" },
  { id: "template3", label: "Minimal", description: "Clean and minimal with simple trust bar.", icon: "grid" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { config, updateConfig, saveConfig } = useStorefront();

  const [step, setStep] = useState<"account" | "template" | "review">("account");
  const [accountType, setAccountType] = useState<"new" | "existing">("new");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    storeName: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState<StorefrontTemplateId>("template1");

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountType === "new") {
      if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
        alert("Please fill in all required fields.");
        return;
      }
    } else {
      if (!form.email.trim() || !form.password.trim()) {
        alert("Please enter your email and password.");
        return;
      }
    }
    setStep("template");
  };

  const handleTemplateSubmit = () => {
    setStep("review");
  };

  const handleCreateStorefront = () => {
    const storeName = form.storeName.trim() || (form.fullName ? `${form.fullName}'s Store` : "My Store");
    const slug = generateSlug(storeName);

    // Build new config based on defaults but with chosen template and store info
    const newConfig = {
      ...defaultStorefrontConfig,
      store: {
        ...defaultStorefrontConfig.store,
        name: storeName,
        slug,
        description: `${storeName} - Your trusted digital services store.`,
      },
      appearance: {
        ...defaultStorefrontConfig.appearance,
        templateId: selectedTemplate,
        themeId: "modern" as const,
      },
      hero: {
        ...defaultStorefrontConfig.hero,
        title: `Welcome to ${storeName}`,
        subtitle: "Affordable data, airtime, and digital services delivered instantly.",
      },
    };

    // Update context and save
    updateConfig(newConfig);
    saveConfig();

    // Redirect to dashboard storefront management
    router.push("/reseller/storefront-management");
  };

  return (
    <AtlasCard className="w-full max-w-3xl">
      {step === "account" && (
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-950 dark:text-white">
              Become an Atlas Reseller
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Start your own digital services storefront in minutes.
            </p>
          </div>

          {/* Account type toggle */}
          <div className="flex rounded-lg bg-neutral-100 p-1 mb-6 dark:bg-neutral-800">
            <button
              type="button"
              onClick={() => setAccountType("new")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition ${
                accountType === "new"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500"
              }`}
            >
              New Account
            </button>
            <button
              type="button"
              onClick={() => setAccountType("existing")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition ${
                accountType === "existing"
                  ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white"
                  : "text-neutral-500"
              }`}
            >
              Existing Account
            </button>
          </div>

          <form onSubmit={handleAccountSubmit} className="space-y-5">
            {accountType === "new" ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Full Name
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="e.g. John Mensah"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Phone (optional)
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+233 24 000 0000"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a password"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Store Name
                  </label>
                  <input
                    value={form.storeName}
                    onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                    placeholder="Optional – we'll use your name if empty"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Your password"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Store Name
                  </label>
                  <input
                    value={form.storeName}
                    onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                    placeholder="Optional – we'll use your name if empty"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" size="lg">
              Continue
            </Button>
          </form>
        </div>
      )}

      {step === "template" && (
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-950 dark:text-white">
              Choose Your Storefront Template
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              You can change this later in your dashboard.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {templateOptions.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`rounded-xl border-2 p-6 text-left transition ${
                  selectedTemplate === tpl.id
                    ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/20"
                    : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800"
                }`}
              >
                <AtlasIcon name={tpl.icon} className="h-8 w-8 text-neutral-700 dark:text-neutral-300" />
                <p className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
                  {tpl.label}
                </p>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {tpl.description}
                </p>
                {selectedTemplate === tpl.id && (
                  <div className="mt-4 flex items-center gap-1 text-brand-700 dark:text-brand-300 text-sm font-medium">
                    <AtlasIcon name="check" className="h-4 w-4" />
                    Selected
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep("account")}>
              Back
            </Button>
            <Button onClick={handleTemplateSubmit}>
              Review Storefront
            </Button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-neutral-950 dark:text-white">
              Review Your Storefront
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Confirm your details to create your storefront.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Store Information
              </h3>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Store Name</dt>
                  <dd className="font-medium text-neutral-900 dark:text-white">
                    {form.storeName.trim() || (form.fullName ? `${form.fullName}'s Store` : "My Store")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Template</dt>
                  <dd className="font-medium text-neutral-900 dark:text-white">
                    {templateOptions.find((t) => t.id === selectedTemplate)?.label}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Store URL</dt>
                  <dd className="font-medium text-neutral-900 dark:text-white">
                    /customer-store/{generateSlug(form.storeName.trim() || (form.fullName ? `${form.fullName}'s Store` : "My Store"))}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                What happens next?
              </h3>
              <ul className="mt-2 list-disc list-inside text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                <li>You&apos;ll be taken to your dashboard</li>
                <li>Customize your storefront in the management page</li>
                <li>Launch when ready</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => setStep("template")}>
              Back
            </Button>
            <Button onClick={handleCreateStorefront} size="lg">
              Create Storefront
            </Button>
          </div>
        </div>
      )}
    </AtlasCard>
  );
}