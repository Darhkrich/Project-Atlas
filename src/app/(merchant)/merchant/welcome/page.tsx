"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atlas/button";
import { MerchantStorefrontPreview } from "@/components/merchant/storefront/merchant-storefront-preview";
import {
  deriveSlug,
  storefrontUrl,
  validateSlug,
} from "@/lib/merchant/onboarding/slug";
import { startOnboardingDraft } from "@/lib/merchant/onboarding/progress-mutations";
import {
  DEFAULT_TEMPLATE_ID,
  TEMPLATE_CATALOG,
  TEMPLATE_CATEGORY_LABELS,
  templatesForCategory,
} from "@/lib/merchant/templates/catalog";
import { cn } from "@/lib/utils";
import type {
  MerchantStorefrontConfig,
  MerchantTemplateCategory,
} from "@/types/merchant-storefront";

const CATEGORIES_WITH_TEMPLATES: MerchantTemplateCategory[] = [
  ...new Set(TEMPLATE_CATALOG.flatMap((t) => t.recommendedFor)),
];

function merchantIdForSlug(slug: string): string {
  const base = slug || "new";
  return "MER-" + base.toUpperCase().slice(0, 8);
}

function slugErrorMessage(reason: string | undefined): string | null {
  if (reason === "reserved") {
    return "That URL is reserved. Try another store name.";
  }
  if (reason === "too-short") return "Store name is too short.";
  return null;
}

interface SelectedTemplate {
  id: string;
  category: MerchantTemplateCategory;
}

export default function MerchantWelcomePage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<MerchantTemplateCategory>("general");
  const [selectedTemplate, setSelectedTemplate] = useState<SelectedTemplate>({
    id: DEFAULT_TEMPLATE_ID,
    category: "general",
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const slug = deriveSlug(businessName);
  const slugCheck = validateSlug(slug);
  const canStart = businessName.trim().length > 0 && slugCheck.ok;
  const url = storefrontUrl(slug);
  const merchantId = merchantIdForSlug(slug);
  const slugError = slugErrorMessage(slugCheck.reason);

  const templatesInCategory = templatesForCategory(selectedCategory);

  const previewConfig: MerchantStorefrontConfig = {
    storefrontId: merchantId,
    storeName: businessName || "Your store",
    slug: slug || "your-store",
    primaryColor: "#4d8e44",
    accentColor: "#c89c1e",
    tagline: "Quality products, great prices.",
    description: "Discover quality products at great prices.",
    heroTitle: businessName || "Welcome to our store",
    heroDescription: "Browse our collection and find something you love.",
    theme: "airy",
    templateId: selectedTemplate.id,
    templateCategory: selectedTemplate.category,
    announcement: "",
    contactEmail: "",
    contactPhone: "",
    whatsapp: "",
    address: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      tiktok: "",
      twitter: "",
    },
    showAnnouncement: false,
    showTrustSection: true,
    showFeaturedProducts: true,
    status: "draft",
    paymentMethodIds: ["momo"],
    codEnabled: false,
  };

  const handleStart = () => {
    if (!canStart) return;
    startOnboardingDraft({
      businessName: businessName.trim(),
      reservedSlug: slug,
    });
    router.push("/merchant/onboarding");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <a
        href="#welcome-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Atlas Ecommerce
          </span>
          <span className="text-sm text-neutral-500">Free to set up</span>
        </div>
      </header>

      <main id="welcome-main" className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
              Your Atlas store starts here.
            </h1>
            <p className="mt-3 max-w-lg text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
              Reserve your storefront URL now. There is no cost to set up.
              Choose a plan when you are ready to sell.
            </p>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Store name
                </span>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., Glow Beauty"
                  autoComplete="organization"
                  className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                />
              </label>

              <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Your store URL
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-brand-700 dark:text-brand-300">
                  {url}
                </p>
                {businessName.trim() && slugError && (
                  <p role="alert" className="mt-1.5 text-xs text-danger-600">
                    {slugError}
                  </p>
                )}
              </div>

              <div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Template
                </span>
                <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                  Pick a starting point. You can change it any time.
                </p>

                <ul
                  role="list"
                  className="mt-3 flex flex-wrap gap-1.5"
                >
                  {CATEGORIES_WITH_TEMPLATES.map((category) => {
                    const selected = selectedCategory === category;
                    return (
                      <li key={category}>
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          aria-pressed={selected}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition",
                            selected
                              ? "border-brand-600 bg-brand-600 text-white"
                              : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-600"
                          )}
                        >
                          {TEMPLATE_CATEGORY_LABELS[category]}
                        </button>
                      </li>
                    );
                  })}
                </ul>

                {templatesInCategory.length === 0 ? (
                  <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                    No templates in this category yet.
                  </p>
                ) : (
                  <ul role="list" className="mt-3 space-y-2">
                    {templatesInCategory.map((template) => {
                      const selected = selectedTemplate.id === template.id;
                      const comingSoon = template.status === "coming_soon";
                      return (
                        <li key={template.id}>
                          <button
                            type="button"
                            onClick={() => {
                              if (comingSoon) return;
                              setSelectedTemplate({
                                id: template.id,
                                category: selectedCategory,
                              });
                            }}
                            disabled={comingSoon}
                            aria-disabled={comingSoon || undefined}
                            aria-pressed={selected}
                            className={cn(
                              "w-full rounded-lg border px-4 py-3 text-left transition",
                              selected
                                ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                                : comingSoon
                                  ? "cursor-not-allowed border-neutral-200 bg-white opacity-60 dark:border-neutral-800 dark:bg-neutral-900"
                                  : "border-neutral-200 bg-white hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={cn(
                                  "text-xs font-semibold",
                                  selected
                                    ? "text-brand-700 dark:text-brand-300"
                                    : "text-neutral-900 dark:text-neutral-100"
                                )}
                              >
                                {template.name}
                              </p>
                              {comingSoon && (
                                <span className="shrink-0 rounded-full bg-neutral-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                  Coming soon
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                              {template.description}
                            </p>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Merchant ID
                  </p>
                  <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {merchantId}
                  </p>
                </div>
                <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                  <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Setup cost
                  </p>
                  <p className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    Free
                  </p>
                </div>
              </div>

              <Button
                onClick={handleStart}
                disabled={!canStart}
                className="w-full"
              >
                Start setting up
              </Button>
            </div>
          </div>

          <div className="mt-6 lg:mt-0">
            <MerchantStorefrontPreview
              store={previewConfig}
              mode={isMobile ? "mobile" : "desktop"}
            />
          </div>
        </div>
      </main>
    </div>
  );
}