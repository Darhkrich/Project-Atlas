/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AtlasIcon } from "@/components/atlas/icons";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useStoreProducts } from "@/contexts/store-products-context";
import { useCategories } from "@/contexts/categories-context";
import { useEnsuredCategories } from "@/lib/merchant/categories/use-ensured-categories";
import { useProductFilters } from "@/lib/merchant/products/use-product-filters";
import { useMerchantProducts } from "@/lib/merchant/products/use-merchant-products";
import { getStarterCatalog } from "@/lib/merchant/products/starter-catalog";
import type { MerchantProductRow } from "@/lib/merchant/products/types";
import { ProductToolbar } from "@/components/merchant/products/product-toolbar";
import { ProductList } from "@/components/merchant/products/product-list";
import { ProductEmptyState } from "@/components/merchant/products/product-empty-state";
import { ProductDeleteModal } from "@/components/merchant/products/product-delete-modal";

export default function MerchantProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { storefrontConfig } = useStorefrontConfig();
  const { updateProduct, deleteProduct, seedProducts } = useStoreProducts();
  const { getCategoriesForStore } = useCategories();

  const storeSlug = storefrontConfig.slug || "my-store";
  const templateCategory = storefrontConfig.templateCategory;

  const ensuredCategories = useEnsuredCategories(storeSlug, templateCategory);
  const categories =
    ensuredCategories.length > 0
      ? ensuredCategories
      : getCategoriesForStore(storeSlug);

  const filtersApi = useProductFilters();
  const snapshot = useMerchantProducts(filtersApi.filters);

  const [deleteTarget, setDeleteTarget] = useState<MerchantProductRow | null>(
    null
  );
  const [seeding, setSeeding] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const saved = searchParams.get("saved");
    if (saved) {
      setFlash(
        saved === "created"
          ? "Product created."
          : "Changes saved."
      );
      const url = new URL(window.location.href);
      url.searchParams.delete("saved");
      window.history.replaceState({}, "", url.toString());
      const timer = window.setTimeout(() => setFlash(null), 4000);
      return () => window.clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSeedSamples = () => {
    setSeeding(true);
    const catalog = getStarterCatalog(templateCategory);
    seedProducts(storeSlug, catalog);
    window.setTimeout(() => {
      setSeeding(false);
      setFlash("Sample products added. Edit or remove them any time.");
    }, 0);
  };

  const handleArchive = (product: MerchantProductRow) => {
    updateProduct(storeSlug, product.id, { status: "Archived" });
    setDeleteTarget(null);
  };

  const handleDeletePermanently = (product: MerchantProductRow) => {
    deleteProduct(storeSlug, product.id);
    setDeleteTarget(null);
  };

  const showNoProducts =
    snapshot.totalCount === 0 && !filtersApi.hasActiveFilters;
  const showNoMatches =
    snapshot.rows.length === 0 && filtersApi.hasActiveFilters;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          Products
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {snapshot.totalCount === 0
            ? "Add your first product to open the shop."
            : snapshot.totalCount +
              (snapshot.totalCount === 1 ? " product" : " products")}
        </p>
      </div>

      {flash && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800 dark:border-success-900 dark:bg-success-900/30 dark:text-success-200"
        >
          <AtlasIcon
            name="check-circle"
            className="h-4 w-4"
            aria-hidden="true"
          />
          {flash}
        </div>
      )}

      {!showNoProducts && (
        <ProductToolbar
          search={filtersApi.filters.search}
          onSearchChange={filtersApi.setSearch}
          status={filtersApi.filters.status}
          onStatusChange={filtersApi.setStatus}
          categoryId={filtersApi.filters.categoryId}
          onCategoryChange={filtersApi.setCategoryId}
          sort={filtersApi.filters.sort}
          onSortChange={filtersApi.setSort}
          categories={categories}
        />
      )}

      {showNoProducts && (
        <ProductEmptyState
          variant="no-products"
          onSeedSamples={handleSeedSamples}
          seeding={seeding}
        />
      )}

      {showNoMatches && (
        <ProductEmptyState
          variant="no-matches"
          onClearFilters={filtersApi.clearFilters}
        />
      )}

      {!showNoProducts && !showNoMatches && (
        <ProductList
          rows={snapshot.rows}
          onDelete={(product) => setDeleteTarget(product)}
        />
      )}

      <ProductDeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        productName={deleteTarget?.name ?? ""}
        onArchive={() => {
          if (deleteTarget) handleArchive(deleteTarget);
        }}
        onDeletePermanently={() => {
          if (deleteTarget) handleDeletePermanently(deleteTarget);
        }}
      />
    </div>
  );
}