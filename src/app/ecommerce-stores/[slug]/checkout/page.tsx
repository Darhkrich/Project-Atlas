"use client";

import { use } from "react";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { StorefrontCheckoutPage } from "@/components/storefront/storefront-checkout-page";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";
import { usePublicStore } from "@/lib/public-store-bridge";

export default function CheckoutPage({
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
      <StorefrontCheckoutPage store={entry.store} />
    </StorefrontLayout>
  );
}