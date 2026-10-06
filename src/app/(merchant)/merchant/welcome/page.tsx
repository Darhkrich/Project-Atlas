"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atlas/button";
import { MerchantStorefrontPreview } from "@/components/merchant/storefront/merchant-storefront-preview";
import {
  deriveSlug,
  storefrontUrl,
  validateSlug,
} from "@/lib/merchant/onboarding/slug";
import { startOnboardingDraft } from "@/lib/merchant/onboarding/progress-mutations";
import { DEFAULT_TEMPLATE_ID } from "@/lib/merchant/onboarding/templates";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

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

export default function MerchantWelcomePage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");

  const slug = deriveSlug(businessName);
  const slugCheck = validateSlug(slug);
  const canStart = businessName.trim().length > 0 && slugCheck.ok;
  const url = storefrontUrl(slug);
  const merchantId = merchantIdForSlug(slug);
  const slugError = slugErrorMessage(slugCheck.reason);

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
    templateId: DEFAULT_TEMPLATE_ID,
    templateCategory: "general",
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
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
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

          <div aria-hidden="true" className="hidden lg:block">
            <MerchantStorefrontPreview store={previewConfig} mode="desktop" />
          </div>
        </div>
      </main>
    </div>
  );
}