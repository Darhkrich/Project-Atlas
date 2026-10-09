"use client";

import { use } from "react";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { StorefrontCartPage } from "@/components/storefront/storefront-cart-page";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";
import { usePublicStore } from "@/lib/public-store-bridge";

export default function CartPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const entry = usePublicStore(slug);

  if (!entry) {
    return <StoreNotFound variant="store" />;
  }

  return (
    <StorefrontLayout store={entry.store}>
      <StorefrontCartPage store={entry.store} />
    </StorefrontLayout>
  );
}