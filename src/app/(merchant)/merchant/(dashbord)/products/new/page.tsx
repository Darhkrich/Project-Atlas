"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useCategories } from "@/contexts/categories-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useEnsuredCategories } from "@/lib/merchant/categories/use-ensured-categories";
import { ProductForm } from "@/components/merchant/products/product-form";

export default function NewProductPage() {
  const router = useRouter();
  const { storefrontConfig } = useStorefrontConfig();
  const { getProductsForStore } = useStoreProducts();
  const { getCategoriesForStore } = useCategories();

  const storeSlug = storefrontConfig.slug || "my-store";
  const templateCategory = storefrontConfig.templateCategory;

  const ensuredCategories = useEnsuredCategories(storeSlug, templateCategory);
  const categories =
    ensuredCategories.length > 0
      ? ensuredCategories
      : getCategoriesForStore(storeSlug);

  const products = getProductsForStore(storeSlug);
  const categoryCounts: Record<string, number> = {};
  for (const p of products) {
    if (!p.categoryId) continue;
    categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            Add product
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Create a new product for your store.
          </p>
        </div>
        <Link
          href="/merchant/products"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="arrow-left" className="h-4 w-4" aria-hidden="true" />
          Back to products
        </Link>
      </div>

      <ProductForm
        mode="create"
        storeSlug={storeSlug}
        initial={null}
        categories={categories}
        categoryCounts={categoryCounts}
        onSaved={() => router.push("/merchant/products?saved=created")}
        onCancel={() => router.push("/merchant/products")}
      />
    </div>
  );
}