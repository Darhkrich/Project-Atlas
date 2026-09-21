/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { useStorefront } from "@/contexts/storefront-context";
import { StorefrontRenderer } from "@/components/reseller/storefront/storefront-renderer";
import { generateSlug, validateStorefrontConfig } from "@/lib/storefront/utils";
import { DomainSection } from "@/components/domains/domain-section";
import type {
  StorefrontTemplateId,
  StorefrontThemeId,
  HeroTemplateId,
} from "@/lib/storefront/types";

const templateOptions: {
  id: StorefrontTemplateId;
  label: string;
  description: string;
  icon: "store" | "briefcase" | "grid";
}[] = [
  { id: "template1", label: "Template 1", description: "Classic professional layout.", icon: "store" },
  { id: "template2", label: "Template 2", description: "Modern with accent bar.", icon: "briefcase" },
  { id: "template3", label: "Template 3", description: "Minimal clean layout.", icon: "grid" },
];

const themeOptions: {
  id: StorefrontThemeId;
  label: string;
  description: string;
}[] = [
  { id: "modern", label: "Modern", description: "Bold and contemporary." },
  { id: "classic", label: "Classic", description: "Professional and timeless." },
  { id: "minimal", label: "Minimal", description: "Clean and understated." },
];

const heroTemplateOptions: {
  id: HeroTemplateId;
  label: string;
  description: string;
}[] = [
  { id: "classic", label: "Classic", description: "Left-aligned text with trust indicators." },
  { id: "split", label: "Split", description: "Text and image side by side." },
  { id: "centered", label: "Centered", description: "Centered text with prominent CTA." },
  { id: "commerce", label: "Commerce", description: "Ecommerce style with service cards." },
  { id: "promotional", label: "Promotional", description: "For limited-time offers." },
];

export default function StorefrontManagementPage() {
  const {
    config,
    updateConfig,
    saveConfig,
    launchStorefront,
    unpublishStorefront,
    resetConfig,
  } = useStorefront();

  const [activeTab, setActiveTab] = useState<
    "branding" | "appearance" | "hero" | "services" | "pricing" | "contact"
  >("branding");
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const validationErrors = validateStorefrontConfig(config);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setSaveStatus("Please fix the highlighted errors.");
      return;
    }
    saveConfig();
    setSaveStatus("Changes saved successfully.");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const handleLaunch = () => {
    const validationErrors = validateStorefrontConfig(config);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaveStatus("Cannot launch: fix validation errors.");
      return;
    }
    launchStorefront();
    setSaveStatus("Storefront is live!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const handleUnpublish = () => {
    unpublishStorefront();
    setSaveStatus("Storefront unpublished.");
    setTimeout(() => setSaveStatus(""), 2000);
  };

  const handleSlugChange = (slug: string) => {
    const cleaned = generateSlug(slug);
    updateConfig({ store: { ...config.store, slug: cleaned } });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateConfig({ store: { ...config.store, logo: dataUrl } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateConfig({ hero: { ...config.hero, image: dataUrl } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
            Storefront Management
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Customize your customer-facing storefront.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetConfig}>Reset</Button>
          <Button variant="outline" onClick={handleSave}>Save Changes</Button>
          {config.publication.isPublished ? (
            <Button variant="outline" onClick={handleUnpublish}>Unpublish</Button>
          ) : (
            <Button onClick={handleLaunch}>Launch Storefront</Button>
          )}
        </div>
      </div>

      <AtlasCard className="border-brand-100 dark:border-brand-900/40">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon name="store" className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-neutral-950 dark:text-white">{config.store.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  config.publication.isPublished
                    ? "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300"
                    : "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300"
                }`}>
                  {config.publication.isPublished ? "Live" : "Draft"}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {`/customer-store/${config.store.slug}`}
              </p>
            </div>
          </div>
          {saveStatus && <p className="text-sm text-neutral-600 dark:text-neutral-400">{saveStatus}</p>}
        </div>
      </AtlasCard>

      <div className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <AtlasCard padding="none" className="overflow-hidden">
          <div className="grid grid-cols-6 border-b border-neutral-200 dark:border-neutral-800">
            {[
              { id: "branding", label: "Branding" },
              { id: "appearance", label: "Appearance" },
              { id: "hero", label: "Hero" },
              { id: "services", label: "Services" },
              { id: "pricing", label: "Pricing" },
              { id: "contact", label: "Contact" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
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

          <div className="p-5 space-y-5 max-h-[calc(100vh-250px)] overflow-y-auto">
            {activeTab === "branding" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Store Name
                  </label>
                  <input
                    value={config.store.name}
                    onChange={(e) => updateConfig({ store: { ...config.store, name: e.target.value } })}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                  {errors.storeName && <p className="mt-1 text-xs text-danger-600">{errors.storeName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Slug (Development URL)
                  </label>
                  <input
                    value={config.store.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                  {errors.slug && <p className="mt-1 text-xs text-danger-600">{errors.slug}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Logo
                  </label>
                  <div className="mt-2 flex items-center gap-4">
                    {config.store.logo ? (
                      <img
                        src={config.store.logo}
                        alt="Logo preview"
                        className="h-12 w-12 rounded-lg object-contain border border-neutral-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <AtlasIcon name="store" className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                        Upload Logo
                      </Button>
                      {config.store.logo && (
                        <button
                          onClick={() => updateConfig({ store: { ...config.store, logo: "" } })}
                          className="ml-2 text-xs text-neutral-500 hover:text-danger-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Store Description
                  </label>
                  <textarea
                    value={config.store.description}
                    onChange={(e) => updateConfig({ store: { ...config.store, description: e.target.value } })}
                    rows={2}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {activeTab === "appearance" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Template
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {templateOptions.map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => updateConfig({ appearance: { ...config.appearance, templateId: tpl.id } })}
                        className={`rounded-xl border-2 p-3 text-left transition ${
                          config.appearance.templateId === tpl.id
                            ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/20"
                            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800"
                        }`}
                      >
                        <AtlasIcon name={tpl.icon} className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                        <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-white">{tpl.label}</p>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{tpl.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    Theme
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {themeOptions.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => updateConfig({ appearance: { ...config.appearance, themeId: theme.id } })}
                        className={`rounded-xl border-2 p-3 text-left transition ${
                          config.appearance.themeId === theme.id
                            ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/20"
                            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800"
                        }`}
                      >
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{theme.label}</p>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{theme.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Primary Color
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="color"
                        value={config.branding.primaryColor}
                        onChange={(e) => updateConfig({ branding: { ...config.branding, primaryColor: e.target.value } })}
                        className="h-10 w-12 cursor-pointer rounded border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
                      />
                      <input
                        value={config.branding.primaryColor}
                        onChange={(e) => updateConfig({ branding: { ...config.branding, primaryColor: e.target.value } })}
                        className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm uppercase text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Accent Color
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="color"
                        value={config.branding.accentColor}
                        onChange={(e) => updateConfig({ branding: { ...config.branding, accentColor: e.target.value } })}
                        className="h-10 w-12 cursor-pointer rounded border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-neutral-900"
                      />
                      <input
                        value={config.branding.accentColor}
                        onChange={(e) => updateConfig({ branding: { ...config.branding, accentColor: e.target.value } })}
                        className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm uppercase text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Border Radius
                  </label>
                  <select
                    value={config.appearance.borderRadius}
                    onChange={(e) => updateConfig({ appearance: { ...config.appearance, borderRadius: e.target.value as any } })}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  >
                    <option value="none">None</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Card Style
                  </label>
                  <select
                    value={config.appearance.cardStyle}
                    onChange={(e) => updateConfig({ appearance: { ...config.appearance, cardStyle: e.target.value as any } })}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  >
                    <option value="flat">Flat</option>
                    <option value="bordered">Bordered</option>
                    <option value="shadowed">Shadowed</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === "hero" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Hero Section</h2>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Customize the main banner of your storefront.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Hero Template</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {heroTemplateOptions.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => updateConfig({ hero: { ...config.hero, template: tpl.id } })}
                        className={`rounded-xl border-2 p-3 text-left transition ${
                          config.hero.template === tpl.id
                            ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-950/20"
                            : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800"
                        }`}
                      >
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">{tpl.label}</p>
                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{tpl.description}</p>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    Current hero template: <strong>{config.hero.template}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">Headline</label>
                  <input
                    value={config.hero.title}
                    onChange={(e) => updateConfig({ hero: { ...config.hero, title: e.target.value } })}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">Subtitle</label>
                  <textarea
                    value={config.hero.subtitle}
                    onChange={(e) => updateConfig({ hero: { ...config.hero, subtitle: e.target.value } })}
                    rows={2}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">Primary Button Label</label>
                  <input
                    value={config.hero.primaryAction.label}
                    onChange={(e) => updateConfig({ hero: { ...config.hero, primaryAction: { ...config.hero.primaryAction, label: e.target.value } } })}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">Secondary Button Label (optional)</label>
                  <input
                    value={config.hero.secondaryAction?.label || ""}
                    onChange={(e) => {
                      const label = e.target.value;
                      if (label.trim()) {
                        updateConfig({ hero: { ...config.hero, secondaryAction: { label, type: "services" } } });
                      } else {
                        const { secondaryAction, ...rest } = config.hero;
                        updateConfig({ hero: rest });
                      }
                    }}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={config.hero.showServices}
                    onChange={(e) => updateConfig({ hero: { ...config.hero, showServices: e.target.checked } })}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-500"
                  />
                  Show featured services in hero
                </label>

                {config.hero.showServices && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Featured Services</label>
                    <div className="space-y-2">
                      {["airtime", "data", "electricity", "cabletv", "exampins"].map((serviceId) => {
                        const checked = config.hero.featuredServices?.includes(serviceId) || false;
                        return (
                          <label key={serviceId} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const current = config.hero.featuredServices || [];
                                const updated = e.target.checked
                                  ? [...current, serviceId]
                                  : current.filter((id) => id !== serviceId);
                                updateConfig({ hero: { ...config.hero, featuredServices: updated } });
                              }}
                              className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-500"
                            />
                            <span className="text-sm text-neutral-900 dark:text-white">{serviceId}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">Hero Image</label>
                  <div className="mt-2 flex items-center gap-4">
                    {config.hero.image ? (
                      <img src={config.hero.image} alt="Hero" className="h-16 w-24 object-cover rounded-lg border border-neutral-200" />
                    ) : (
                      <div className="h-16 w-24 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <AtlasIcon name="image" className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <input ref={heroImageInputRef} type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                      <Button variant="outline" size="sm" onClick={() => heroImageInputRef.current?.click()}>Upload Image</Button>
                      {config.hero.image && (
                        <button
                          onClick={() => updateConfig({ hero: { ...config.hero, image: "" } })}
                          className="ml-2 text-xs text-neutral-500 hover:text-danger-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Featured Services
                </label>
                {errors.services && <p className="text-xs text-danger-600 mb-2">{errors.services}</p>}
                <div className="space-y-2">
                  {["airtime", "data", "electricity", "cabletv", "exampins"].map((serviceId) => {
                    const checked = config.services.featured.includes(serviceId);
                    return (
                      <label key={serviceId} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...config.services.featured, serviceId]
                              : config.services.featured.filter((id) => id !== serviceId);
                            updateConfig({ services: { ...config.services, featured: updated } });
                          }}
                          className="h-4 w-4 rounded border-neutral-300 text-brand-700 focus:ring-brand-500"
                        />
                        <span className="text-sm text-neutral-900 dark:text-white">{serviceId}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Pricing Markup
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Set your profit margin as a percentage of Atlas prices.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Markup Percentage (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={config.pricing.maxMarkupPercent}
                    value={config.pricing.markupPercent}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 0 && val <= config.pricing.maxMarkupPercent) {
                        updateConfig({ pricing: { ...config.pricing, markupPercent: val } });
                      }
                    }}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Maximum allowed: {config.pricing.maxMarkupPercent}%
                  </p>
                  {errors.markup && <p className="mt-1 text-xs text-danger-600">{errors.markup}</p>}
                </div>
                <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Example: If an MTN 1GB bundle costs GH₵6.00, with a {config.pricing.markupPercent}% markup, your customer pays GH₵
                    {(6 * (1 + config.pricing.markupPercent / 100)).toFixed(2)}.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Phone
                  </label>
                  <input
                    value={config.contact.phone}
                    onChange={(e) => updateConfig({ contact: { ...config.contact, phone: e.target.value } })}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    WhatsApp
                  </label>
                  <input
                    value={config.contact.whatsapp}
                    onChange={(e) => updateConfig({ contact: { ...config.contact, whatsapp: e.target.value } })}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Email
                  </label>
                  <input
                    value={config.contact.email}
                    onChange={(e) => updateConfig({ contact: { ...config.contact, email: e.target.value } })}
                    className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                {errors.contact && <p className="text-xs text-danger-600">{errors.contact}</p>}
              </>
            )}
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-800">
            <DomainSection
              storefrontId={config.storefrontId}
              storefrontName={config.store.name}
              variant="reseller"
              ownerName={config.store.name}
              ownerEmail={config.contact.email}
              framed={false}
            />
          </div>
        </AtlasCard>

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
          <div className="min-h-[600px] bg-neutral-100 p-4 dark:bg-neutral-950 sm:p-6 overflow-auto">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-600">
                Hero: {config.hero.template}
              </span>
            </div>
            <div
              className={`bg-white transition-all mx-auto ${
                previewMode === "mobile"
                  ? "max-w-[390px] rounded-[2rem] border-[6px] border-neutral-900 shadow-lg"
                  : "w-full max-w-none rounded-2xl border border-neutral-200 shadow-sm"
              }`}
              style={{ height: previewMode === "mobile" ? "700px" : "auto", overflowY: "auto" }}
            >
              <StorefrontRenderer
                key={`${config.hero.template}-${config.appearance.templateId}-${config.appearance.themeId}`}
                config={config}
                mode="preview"
              />
            </div>
          </div>
        </AtlasCard>
      </div>
    </div>
  );
}