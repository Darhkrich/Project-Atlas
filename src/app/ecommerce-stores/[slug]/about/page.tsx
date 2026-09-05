"use client";

import { use } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { StorefrontAboutPage } from "@/components/storefront/storefront-about-page";
import { storesWithProducts } from "@/lib/public-store";

export default function AboutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { storefrontConfig } = useStorefrontConfig();

  const store =
    storefrontConfig.slug === slug
      ? storefrontConfig
      : storesWithProducts.find((s) => s.store.slug === slug)?.store;

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-600">Store not found.</p>
      </div>
    );
  }

  return (
    <StorefrontLayout store={store}>
      <StorefrontAboutPage store={store} />
    </StorefrontLayout>
  );
}