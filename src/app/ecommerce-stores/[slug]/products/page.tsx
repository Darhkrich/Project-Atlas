"use client";

import { Suspense, use } from "react";
import { templateRegistry } from "@/components/storefront/templates";
import { usePublicStore } from "@/lib/public-store-bridge";
import { StoreNotFound } from "@/components/storefront/shared/store-not-found";

function ProductsInner({ slug }: { slug: string }) {
  const entry = usePublicStore(slug);

  if (!entry) {
    return <StoreNotFound variant="store" />;
  }

  const template =
    templateRegistry[
      entry.store.templateId as keyof typeof templateRegistry
    ] ?? templateRegistry["tpl-general-store"];

  const TemplateProducts = template.Products;
  return <TemplateProducts store={entry.store} products={entry.products} />;
}

export default function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return (
    <Suspense>
      <ProductsInner slug={slug} />
    </Suspense>
  );
}