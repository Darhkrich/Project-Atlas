"use client";

import { use } from "react";
import { templateRegistry } from "@/components/storefront/templates";
import { storesWithProducts } from "@/lib/public-store";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";

export default function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const entry = storesWithProducts.find((s) => s.store.slug === slug);
  if (!entry) {
    return <StoreNotFound variant="store" />;
  }

  const template =
    templateRegistry[
      entry.store.templateId as keyof typeof templateRegistry
    ] ?? templateRegistry["tpl-general-store"];

  const TemplateHome = template.Home;
  return <TemplateHome store={entry.store} products={entry.products} />;
}