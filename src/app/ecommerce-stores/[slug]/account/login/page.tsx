"use client";

import { use } from "react";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { CustomerLoginPage } from "@/components/storefront/customer-login-page";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";
import { storesWithProducts } from "@/lib/public-store";

export default function LoginPage({
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
      <CustomerLoginPage store={entry.store} />
    </StorefrontLayout>
  );
}