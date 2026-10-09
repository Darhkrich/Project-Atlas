"use client";

import { use } from "react";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { CustomerOrderDetailPage } from "@/components/storefront/customer-order-detail-page";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";
import { usePublicStore } from "@/lib/public-store-bridge";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>;
}) {
  const { slug, orderId } = use(params);
  const entry = usePublicStore(slug);

  if (!entry) {
    return <StoreNotFound variant="store" />;
  }

  return (
    <StorefrontLayout store={entry.store}>
      <CustomerOrderDetailPage store={entry.store} orderId={orderId} />
    </StorefrontLayout>
  );
}