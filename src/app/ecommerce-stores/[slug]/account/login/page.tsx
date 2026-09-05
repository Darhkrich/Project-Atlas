"use client";

import { use } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { CustomerLoginPage } from "@/components/storefront/customer-login-page";
import { storesWithProducts } from "@/lib/public-store";

export default function LoginPage({
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
    return <div>Store not found.</div>;
  }

  return (
    <StorefrontLayout store={store}>
      <CustomerLoginPage store={store} />
    </StorefrontLayout>
  );
}