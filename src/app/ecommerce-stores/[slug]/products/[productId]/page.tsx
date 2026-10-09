"use client";

import { use } from "react";
import { templateRegistry } from "@/components/storefront/templates";
import { usePublicStore } from "@/lib/public-store-bridge";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = use(params);
  const entry = usePublicStore(slug);

  if (!entry) {
    return <StoreNotFound variant="store" />;
  }

  const product = entry.products.find((p) => p.id === productId);
  if (!product) {
    return <StoreNotFound variant="product" />;
  }

  const template =
    templateRegistry[
      entry.store.templateId as keyof typeof templateRegistry
    ] ?? templateRegistry["tpl-general-store"];

  const TemplateProductDetail = template.ProductDetail;
  return (
    <TemplateProductDetail
      store={entry.store}
      product={product}
      products={entry.products}
    />
  );
}