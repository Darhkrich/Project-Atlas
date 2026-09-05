"use client";

import { use } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { StorefrontContactPage } from "@/components/storefront/storefront-contact-page";
import { storesWithProducts } from "@/lib/public-store";

export default function ContactPage({
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
      <StorefrontContactPage store={store} />
    </StorefrontLayout>
  );
}