"use client";

import { use } from "react";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { templateRegistry } from "@/components/storefront/templates";
import { getProductsForStore as getStaticProducts } from "@/lib/store-products";
import { storesWithProducts } from "@/lib/public-store";

export default function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { storefrontConfig } = useStorefrontConfig();
  const { getProductsForStore } = useStoreProducts();

  const store =
    storefrontConfig.slug === slug
      ? storefrontConfig
      : storesWithProducts.find((s) => s.store.slug === slug)?.store;

  if (!store) {
    return <div>Store not found.</div>;
  }

  let products = getProductsForStore(store.slug);
  if (products.length === 0) {
    products = getStaticProducts(store.templateCategory);
  }

  const template = templateRegistry[store.templateId as keyof typeof templateRegistry]
    ?? templateRegistry["tpl-general-store"];

  const TemplateProducts = template.Products;

  return (
    <StorefrontLayout store={store}>
      <TemplateProducts store={store} products={products} />
    </StorefrontLayout>
  );
}