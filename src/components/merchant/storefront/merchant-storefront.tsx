/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { MerchantStorefrontPreview } from "./merchant-storefront-preview";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useSubscription } from "@/contexts/subscription-context";
import { getPlanByCode } from "@/config/subscription-plans";
import { DomainSection } from "@/components/domains/domain-section";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import Link from "next/link";

type ActiveTab = "branding" | "appearance" | "settings";

const allThemes = [
  { id: "modern", label: "Modern", description: "Bold and conversion-focused." },
  { id: "classic", label: "Classic", description: "Professional and timeless." },
  { id: "minimal", label: "Minimal", description: "Clean and product-focused." },
];

function generateSuggestion(
  type: "tagline" | "description" | "heroTitle" | "heroDescription",
  storeName: string,
  category: string,
): string {
  const templates: Record<string, string[]> = {
    tagline: [
      "Quality products, great prices.",
      "Your trusted source for quality.",
      "Elevate your everyday.",
    ],
    description: [
      `Welcome to ${storeName}. We offer a curated selection of products to help you look and feel your best.`,
      `Discover the best in ${category} at ${storeName}. Fast delivery, secure payments, and exceptional customer service.`,
    ],
    heroTitle: [
      `Discover Your Next Favorite`,
      `Welcome to ${storeName}`,
      `Shop the Latest Trends`,
    ],
    heroDescription: [
      `Explore our collection and find something you'll love.`,
      `Quality products, fast delivery, and secure checkout. Start shopping today.`,
    ],
  };

  const options = templates[type] || [];
  return options[Math.floor(Math.random() * options.length)] || "";
}

export function MerchantStorefrontManagement() {
  const { storefrontConfig, updateStorefrontConfig } = useStorefrontConfig();
  const { currentPlan } = useSubscription();
  const plan = getPlanByCode(currentPlan);
  const [activeTab, setActiveTab] = useState<ActiveTab>("branding");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const store = storefrontConfig;

  const updateStore = (updates: Partial<MerchantStorefrontConfig>) => {
    setSaved(false);
    updateStorefrontConfig(updates);
  };

  const updateSocialLink = (
    key: keyof MerchantStorefrontConfig["socialLinks"],
    value: string,
  ) => {
    setSaved(false);
    updateStorefrontConfig({
      socialLinks: {
        ...store.socialLinks,
        [key]: value,
      },
    });
  };

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleStoreStatus = () => {
    const newStatus = store.status === "live" ? "draft" : "live";
    updateStore({ status: newStatus });
    setStatusMessage(
      newStatus === "live"
        ? "Your store is now live and accessible to customers."
        : "Your store has been unpublished. Customers can no longer access it.",
    );
    window.setTimeout(() => setStatusMessage(""), 3000);
  };

  const storeUrl = `https://atlas.com/ecommerce/${store.slug}`;

  const applyAiSuggestion = (
    field: "tagline" | "description" | "heroTitle" | "heroDescription",
  ) => {
    const suggestion = generateSuggestion(
      field,
      store.storeName,
      store.templateCategory,
    );
    if (suggestion) {
      updateStore({ [field]: suggestion } as Partial<MerchantStorefrontConfig>);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
            My Ecommerce Store
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Customize your online store
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Personalize your store&apos;s identity, appearance, and settings, then preview
            how customers will experience your shop.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(storeUrl, "_blank")}
            className="inline-flex items-center gap-2"
          >
            <AtlasIcon name="eye" className="h-4 w-4" />
            View Store
          </Button>

          <Button
            variant="outline"
            onClick={handleToggleStoreStatus}
            className="inline-flex items-center gap-2"
          >
            <AtlasIcon
              name={store.status === "live" ? "x-circle" : "check"}
              className="h-4 w-4"
            />
            {store.status === "live" ? "Unpublish Store" : "Launch Store"}
          </Button>
          <Link
            href="/merchant/products"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="package" className="h-4 w-4" />
            Manage Products
          </Link>
          <Button onClick={handleSave} className="inline-flex items-center gap-2">
            <AtlasIcon name="check" className="h-4 w-4" />
            {saved ? "Saved" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Status message */}
      {statusMessage && (
        <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
          {statusMessage}
        </div>
      )}

      {/* Store status */}
      <AtlasCard className="border-brand-100 dark:border-brand-900/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon name="store" className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                  {store.storeName}
                </p>
                <span className="rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700 dark:bg-success-900/30 dark:text-success-300">
                  {store.status === "live" ? "Live" : "Draft"}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {storeUrl}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <span>
              Template:{" "}
              <span className="font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                {store.templateId}
              </span>
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block" />
            <span>
              Theme:{" "}
              <span className="font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                {store.theme}
              </span>
            </span>
          </div>
        </div>
      </AtlasCard>

      {/* Editor + Preview */}
      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        {/* Configuration panel */}
        <AtlasCard padding="none" className="overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-3 border-b border-neutral-200 dark:border-neutral-800">
            {[
              { id: "branding" as const, label: "Branding" },
              { id: "appearance" as const, label: "Appearance" },
              { id: "settings" as const, label: "Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-700 text-brand-800 dark:border-brand-400 dark:text-brand-300"
                    : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Branding tab */}
            {activeTab === "branding" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Brand identity
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    These details appear throughout your online store.
                  </p>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Store Name
                  </span>
                  <input
                    value={store.storeName}
                    onChange={(e) => updateStore({ storeName: e.target.value })}
                    placeholder="e.g., Glow Beauty"
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Tagline
                  </span>
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={store.tagline}
                      onChange={(e) => updateStore({ tagline: e.target.value })}
                      placeholder="e.g., Beauty that shines"
                      className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => applyAiSuggestion("tagline")}
                      className="shrink-0"
                    >
                      ✨ Generate
                    </Button>
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Store Description
                  </span>
                  <div className="mt-1.5 flex gap-2">
                    <textarea
                      value={store.description}
                      onChange={(e) => updateStore({ description: e.target.value })}
                      rows={3}
                      placeholder="Tell customers about your store..."
                      className="flex-1 resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => applyAiSuggestion("description")}
                      className="shrink-0 self-start"
                    >
                      ✨ Generate
                    </Button>
                  </div>
                </label>

                <div>
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Store Logo
                  </span>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                      {logoPreview || store.logo ? (
                        <img
                          src={logoPreview || store.logo}
                          alt="Logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AtlasIcon name="image" className="h-6 w-6 text-neutral-400" />
                      )}
                    </div>
                    <label className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800">
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const dataUrl = reader.result as string;
                              setLogoPreview(dataUrl);
                              updateStore({ logo: dataUrl });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {(logoPreview || store.logo) && (
                      <button
                        onClick={() => {
                          setLogoPreview(null);
                          updateStore({ logo: "" });
                        }}
                        className="text-xs text-danger-600 hover:text-danger-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-[11px] text-neutral-500">
                    PNG, JPG, or SVG. Recommended square image.
                  </p>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Hero Title
                  </span>
                  <div className="mt-1.5 flex gap-2">
                    <textarea
                      value={store.heroTitle}
                      onChange={(e) => updateStore({ heroTitle: e.target.value })}
                      rows={2}
                      className="flex-1 resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => applyAiSuggestion("heroTitle")}
                      className="shrink-0 self-start"
                    >
                      ✨ Generate
                    </Button>
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Hero Description
                  </span>
                  <div className="mt-1.5 flex gap-2">
                    <textarea
                      value={store.heroDescription}
                      onChange={(e) => updateStore({ heroDescription: e.target.value })}
                      rows={3}
                      className="flex-1 resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => applyAiSuggestion("heroDescription")}
                      className="shrink-0 self-start"
                    >
                      ✨ Generate
                    </Button>
                  </div>
                </label>
              </div>
            )}

            {/* Appearance tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Store appearance
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Customize the look of your selected template.
                  </p>
                </div>

                <div className="rounded-lg bg-neutral-100 p-3 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                  <span className="font-medium">Selected Template:</span>{" "}
                  {store.templateId}
                </div>

                <div>
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Theme
                  </p>
                  <div className="mt-3 space-y-2">
                    {allThemes.map((theme) => {
                      const isAllowed = plan.themes.includes(theme.id);
                      const selected = store.theme === theme.id;

                      return (
                        <button
                          key={theme.id}
                          type="button"
                          disabled={!isAllowed}
                          onClick={() =>
                            updateStore({ theme: theme.id as MerchantStorefrontConfig["theme"] })
                          }
                          className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-brand-600 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/20"
                              : isAllowed
                              ? "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
                              : "border-neutral-200 opacity-60 cursor-not-allowed dark:border-neutral-800"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${
                              selected ? "border-brand-700" : "border-neutral-300 dark:border-neutral-700"
                            }`}
                          >
                            {selected && <span className="h-2 w-2 rounded-full bg-brand-700" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                                {theme.label}
                              </p>
                              {!isAllowed && (
                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                  Upgrade
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                              {theme.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-neutral-500">
                    Your current plan ({currentPlan}) includes {plan.themes.length} theme(s).{" "}
                    <a href="/merchant/billing" className="text-brand-600 hover:underline">
                      Upgrade plan
                    </a>
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Primary Color
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="color"
                      value={store.primaryColor}
                      onChange={(e) => updateStore({ primaryColor: e.target.value })}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
                    />
                    <input
                      value={store.primaryColor}
                      onChange={(e) => updateStore({ primaryColor: e.target.value })}
                      className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm uppercase text-neutral-900 outline-none focus:border-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Accent Color
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="color"
                      value={store.accentColor}
                      onChange={(e) => updateStore({ accentColor: e.target.value })}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
                    />
                    <input
                      value={store.accentColor}
                      onChange={(e) => updateStore({ accentColor: e.target.value })}
                      className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm uppercase text-neutral-900 outline-none focus:border-brand-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Settings tab */}
            {activeTab === "settings" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Store settings
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Configure contact details, social links, and preferences.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Contact Email
                    </span>
                    <input
                      value={store.contactEmail}
                      onChange={(e) => updateStore({ contactEmail: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Contact Phone
                    </span>
                    <input
                      value={store.contactPhone}
                      onChange={(e) => updateStore({ contactPhone: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      WhatsApp Number
                    </span>
                    <input
                      value={store.whatsapp}
                      onChange={(e) => updateStore({ whatsapp: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Business Address
                    </span>
                    <input
                      value={store.address}
                      onChange={(e) => updateStore({ address: e.target.value })}
                      className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Store Slug (URL path)
                    </span>
                    <input
                      value={store.slug}
                      onChange={(e) =>
                        updateStore({
                          slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      placeholder="glow-beauty"
                      className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    />
                    <p className="mt-1 text-[11px] text-neutral-500">
                      This is used for your development URL: /ecommerce-stores/your-slug
                    </p>
                  </label>

                  <div className="flex items-center justify-between sm:col-span-2">
                    <div>
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Cash on Delivery
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Allow customers to pay when their order is delivered.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateStore({ codEnabled: !store.codEnabled })}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        store.codEnabled ? "bg-brand-600" : "bg-neutral-300 dark:bg-neutral-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          store.codEnabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Domain settings */}
                <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <DomainSection
                    storefrontId={store.storefrontId}
                    storefrontName={store.storeName}
                    variant="merchant"
                    ownerName={store.storeName}
                    ownerEmail={store.contactEmail}
                    planOptions={{
                      customDomain: plan.domainOptions.includes("custom-domain"),
                    }}
                    framed={false}
                  />
                </div>

                {/* Social links */}
                <div>
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Social Links
                  </p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {["facebook", "instagram", "tiktok", "twitter"].map((social) => (
                      <input
                        key={social}
                        value={store.socialLinks[social as keyof MerchantStorefrontConfig["socialLinks"]]}
                        onChange={(e) =>
                          updateSocialLink(
                            social as keyof MerchantStorefrontConfig["socialLinks"],
                            e.target.value,
                          )
                        }
                        placeholder={`${social.charAt(0).toUpperCase() + social.slice(1)} URL`}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                      />
                    ))}
                  </div>
                </div>

                {/* Toggle trust section */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Show Trust Section
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      Display secure payments, fast delivery, and support.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateStore({ showTrustSection: !store.showTrustSection })}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      store.showTrustSection ? "bg-brand-600" : "bg-neutral-300 dark:bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        store.showTrustSection ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </AtlasCard>

        {/* Preview panel */}
        <AtlasCard padding="none" className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
            <div>
              <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                Storefront Preview
              </h2>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                This is how your storefront will appear to customers.
              </p>
            </div>

            <div className="flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-900">
              <button
                type="button"
                onClick={() => setPreviewMode("desktop")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  previewMode === "desktop"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500"
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("mobile")}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  previewMode === "mobile"
                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500"
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          <div className="min-h-[700px] bg-neutral-100 p-4 dark:bg-neutral-950 sm:p-6">
            <MerchantStorefrontPreview store={store} mode={previewMode} />
          </div>
        </AtlasCard>
      </div>

      {/* Storefront info footer */}
      <AtlasCard>
        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Storefront link
            </p>
            <p className="mt-2 break-all text-sm font-semibold text-neutral-900 dark:text-white">
              {storeUrl}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Template
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-white">
              {store.templateId}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Theme
            </p>
            <p className="mt-2 text-sm font-semibold capitalize text-neutral-900 dark:text-white">
              {store.theme}
            </p>
          </div>
        </div>
      </AtlasCard>
    </div>
  );
}