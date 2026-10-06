"use client";

import { use } from "react";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { StorefrontAboutPage } from "@/components/storefront/storefront-about-page";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";
import { storesWithProducts } from "@/lib/public-store";

export default function AboutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const entry = storesWithProducts.find((s) => s.store.slug === slug);
  if (!entry) {
    return <StoreNotFound variant="store" />;
  }

  return (
    <StorefrontLayout store={entry.store}>
      <StorefrontAboutPage store={entry.store} />
    </StorefrontLayout>
  );
}