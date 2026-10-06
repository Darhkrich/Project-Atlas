/* eslint-disable react-hooks/purity */
"use client";

import Link from "next/link";
import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { useAuth } from "@/contexts/auth-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useNow } from "@/lib/shared/hooks/use-now";
import { seedMerchantDashboard } from "@/lib/merchant/dashboard/dev-seed";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface GreetingRibbonProps {
  store: MerchantStorefrontConfig;
  storeUrl: string;
  canSeed: boolean;
}

function greetingFor(nowMs: number): string {
  const h = new Date(nowMs).getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function greetingName(
  merchant: { name: string; email: string } | null,
  store: MerchantStorefrontConfig
): string {
  if (!merchant) return store.storeName;
  const emailLocal = merchant.email.split("@")[0] ?? "";
  const name = merchant.name?.trim() ?? "";
  if (!name || name.toLowerCase() === emailLocal.toLowerCase()) {
    return store.storeName;
  }
  return name.split(" ")[0];
}

export function GreetingRibbon({
  store,
  storeUrl,
  canSeed,
}: GreetingRibbonProps) {
  const { user } = useAuth();
  const merchant = useCurrentMerchant();
  const { getProductsForStore } = useStoreProducts();
  const nowMs = useNow();
  const now = nowMs ?? Date.now();
  const greeting = greetingFor(now);
  const displayName = greetingName(merchant, store);
  const [seeding, setSeeding] = useState(false);

  const showSeed =
    canSeed &&
    process.env.NODE_ENV !== "production" &&
    user !== null &&
    !seeding;

  const handleSeed = () => {
    if (!user) return;
    setSeeding(true);
    const products = getProductsForStore(store.slug);
    const wrote = seedMerchantDashboard(user.email, store.slug, products);
    if (wrote) {
      window.location.reload();
    } else {
      setSeeding(false);
    }
  };

  const primaryHref =
    store.status === "draft" ? "/merchant/storefront" : storeUrl;
  const primaryLabel =
    store.status === "draft" ? "Publish store" : "View store";
  const primaryIcon = store.status === "draft" ? "external-link" : "eye";
  const isExternal = store.status !== "draft";

  return (
    <section
      aria-labelledby="dashboard-greeting"
      className="rounded-xl border border-neutral-200 bg-white px-5 py-5 dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {greeting}
          </p>
          <h1
            id="dashboard-greeting"
            className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl"
          >
            {displayName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {store.storeName}
            </span>
            <span
              className="inline-flex items-center gap-1.5"
              aria-label={
                "Store status: " +
                (store.status === "live" ? "Live" : "Draft")
              }
            >
              <span
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (store.status === "live"
                    ? "bg-success-500"
                    : "bg-neutral-400")
                }
                aria-hidden="true"
              />
              <span>{store.status === "live" ? "Live" : "Draft"}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showSeed && (
            <button
              type="button"
              onClick={handleSeed}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
              aria-label="Seed demo data for development"
            >
              <AtlasIcon name="add" className="h-4 w-4" aria-hidden="true" />
              Seed demo orders
            </button>
          )}
          {isExternal ? (
            <Link
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <AtlasIcon
                name={primaryIcon}
                className="h-4 w-4"
                aria-hidden="true"
              />
              {primaryLabel}
            </Link>
          ) : (
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              <AtlasIcon
                name={primaryIcon}
                className="h-4 w-4"
                aria-hidden="true"
              />
              {primaryLabel}
            </Link>
          )}
          <Link
            href="/merchant/storefront"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <AtlasIcon name="store" className="h-4 w-4" aria-hidden="true" />
            {store.status === "draft" ? "Preview" : "Edit store"}
          </Link>
        </div>
      </div>
    </section>
  );
}