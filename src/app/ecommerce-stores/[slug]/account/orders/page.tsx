"use client";

import { use } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { CustomerOrderDetailPage } from "@/components/storefront/customer-order-detail-page";
import { storesWithProducts } from "@/lib/public-store";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>;
}) {
  const { slug, orderId } = use(params);
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
      <CustomerOrderDetailPage store={store} orderId={orderId} />
    </StorefrontLayout>
  );
}