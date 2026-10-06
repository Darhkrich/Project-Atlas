"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useCategories } from "@/contexts/categories-context";
import { useEnsuredCategories } from "@/lib/merchant/categories/use-ensured-categories";
import { useMerchantProduct } from "@/lib/merchant/products/use-merchant-product";
import { ProductForm } from "@/components/merchant/products/product-form";
import { ProductDeleteModal } from "@/components/merchant/products/product-delete-modal";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = (params?.productId as string) ?? "";

  const { storefrontConfig } = useStorefrontConfig();
  const { getProductsForStore, updateProduct, deleteProduct } =
    useStoreProducts();
  const { getCategoriesForStore } = useCategories();

  const storeSlug = storefrontConfig.slug || "my-store";
  const templateCategory = storefrontConfig.templateCategory;

  const ensuredCategories = useEnsuredCategories(storeSlug, templateCategory);
  const categories =
    ensuredCategories.length > 0
      ? ensuredCategories
      : getCategoriesForStore(storeSlug);

  const product = useMerchantProduct(productId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const products = getProductsForStore(storeSlug);
  const categoryCounts: Record<string, number> = {};
  for (const p of products) {
    if (!p.categoryId) continue;
    categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] ?? 0) + 1;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <AtlasIcon
            name="package"
            className="h-5 w-5 text-neutral-500 dark:text-neutral-400"
            aria-hidden="true"
          />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Product not found
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          This product may have been removed.
        </p>
        <Link
          href="/merchant/products"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const handleArchive = () => {
    updateProduct(storeSlug, product.id, { status: "Archived" });
    setDeleteOpen(false);
    router.push("/merchant/products");
  };

  const handleDeletePermanently = () => {
    deleteProduct(storeSlug, product.id);
    setDeleteOpen(false);
    router.push("/merchant/products");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
            Edit product
          </h1>
          <p className="mt-1 truncate text-sm text-neutral-600 dark:text-neutral-400">
            {product.name}
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
        mode="edit"
        storeSlug={storeSlug}
        initial={product}
        categories={categories}
        categoryCounts={categoryCounts}
        onSaved={() => router.push("/merchant/products?saved=updated")}
        onCancel={() => router.push("/merchant/products")}
        onDelete={() => setDeleteOpen(true)}
      />

      <ProductDeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        productName={product.name}
        onArchive={handleArchive}
        onDeletePermanently={handleDeletePermanently}
      />
    </div>
  );
}