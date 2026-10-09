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
import { useProductLimit } from "@/lib/merchant/products/use-product-limit";
import { useProductSelection } from "@/lib/merchant/products/use-product-selection";
import { getStarterCatalog } from "@/lib/merchant/products/starter-catalog";
import { PRODUCT_LIMIT_REDIRECT_NOTICE } from "@/lib/merchant/products/labels";
import type {
  MerchantProductRow,
  ProductStatus,
} from "@/lib/merchant/products/types";
import { ProductToolbar } from "@/components/merchant/products/product-toolbar";
import { ProductList } from "@/components/merchant/products/product-list";
import { ProductEmptyState } from "@/components/merchant/products/product-empty-state";
import { ProductDeleteModal } from "@/components/merchant/products/product-delete-modal";
import { ProductLimitBanner } from "@/components/merchant/products/product-limit-banner";
import { ProductImportModal } from "@/components/merchant/products/product-import-modal";
import { ProductBulkBar } from "@/components/merchant/products/product-bulk-bar";
import { ProductBulkConfirmModal } from "@/components/merchant/products/product-bulk-confirm-modal";

export default function MerchantProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { storefrontConfig } = useStorefrontConfig();
  const {
    updateProduct,
    updateProducts,
    deleteProduct,
    deleteProducts,
    seedProducts,
  } = useStoreProducts();
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
  const limit = useProductLimit();

  const resetKey = JSON.stringify(filtersApi.filters);
  const selection = useProductSelection(resetKey);

  const [deleteTarget, setDeleteTarget] = useState<MerchantProductRow | null>(
    null
  );
  const [importOpen, setImportOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const saved = searchParams.get("saved");
    const limitHit = searchParams.get("limit");
    if (saved) {
      setFlash(saved === "created" ? "Product created." : "Changes saved.");
    } else if (limitHit === "hit") {
      setFlash(PRODUCT_LIMIT_REDIRECT_NOTICE);
    } else {
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    url.searchParams.delete("limit");
    window.history.replaceState({}, "", url.toString());
    const timer = window.setTimeout(() => setFlash(null), 4000);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  function showTimedFlash(message: string) {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 4000);
  }

  const handleSeedSamples = () => {
    setSeeding(true);
    const catalog = getStarterCatalog(templateCategory);
    const remaining =
      limit.isUnlimited || limit.remaining === null
        ? catalog.length
        : Math.min(catalog.length, limit.remaining);
    const toSeed = catalog.slice(0, remaining);
    if (toSeed.length === 0) {
      setSeeding(false);
      setFlash(
        "No room on your plan for sample products. Upgrade to add more."
      );
      return;
    }
    seedProducts(storeSlug, toSeed);
    window.setTimeout(() => {
      setSeeding(false);
      setFlash(
        toSeed.length === catalog.length
          ? "Sample products added. Edit or remove them any time."
          : "Some sample products added. Plan limit reached for the rest."
      );
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

  const handleImported = (added: number, skipped: number) => {
    if (added === 0) {
      showTimedFlash("No products were imported.");
      return;
    }
    if (skipped === 0) {
      showTimedFlash(
        added + (added === 1 ? " product imported." : " products imported.")
      );
    } else {
      showTimedFlash(
        added +
          " imported. " +
          skipped +
          " skipped due to errors or plan limit."
      );
    }
  };

  const visibleIds = snapshot.rows.map((r) => r.id);
  const allSelected = selection.allSelected(visibleIds);
  const someSelected = selection.someSelected(visibleIds);

  function handleToggleAll() {
    if (allSelected) selection.clear();
    else selection.selectAll(visibleIds);
  }

  function handleBulkSetStatus(status: ProductStatus) {
    const count = selection.count;
    updateProducts(storeSlug, selection.ids, { status });
    selection.clear();
    showTimedFlash(
      count +
        (count === 1 ? " product updated." : " products updated.")
    );
  }

  function handleBulkSetCategory(categoryId: string) {
    const count = selection.count;
    updateProducts(storeSlug, selection.ids, { categoryId });
    selection.clear();
    showTimedFlash(
      count +
        (count === 1 ? " product updated." : " products updated.")
    );
  }

  function handleBulkSetFeatured(featured: boolean) {
    const count = selection.count;
    updateProducts(storeSlug, selection.ids, { featured });
    selection.clear();
    showTimedFlash(
      count +
        (count === 1 ? " product updated." : " products updated.")
    );
  }

  function handleBulkArchive() {
    const count = selection.count;
    updateProducts(storeSlug, selection.ids, { status: "Archived" });
    selection.clear();
    showTimedFlash(
      count +
        (count === 1
          ? " product archived."
          : " products archived.")
    );
  }

  function handleBulkDeleteConfirm() {
    const count = selection.count;
    deleteProducts(storeSlug, selection.ids);
    selection.clear();
    setBulkDeleteOpen(false);
    showTimedFlash(
      count +
        (count === 1 ? " product deleted." : " products deleted.")
    );
  }

  const selectedRows = snapshot.rows.filter((r) =>
    selection.isSelected(r.id)
  );

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

      <ProductLimitBanner evaluation={limit} />

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
          atProductLimit={limit.atLimit}
          visibleProductIds={visibleIds}
          onOpenImport={() => setImportOpen(true)}
        />
      )}

      {showNoProducts && (
        <ProductEmptyState
          variant="no-products"
          onSeedSamples={handleSeedSamples}
          seeding={seeding}
          atProductLimit={limit.atLimit}
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
          isSelected={selection.isSelected}
          onToggleSelect={selection.toggle}
          allSelected={allSelected}
          someSelected={someSelected}
          onToggleAll={handleToggleAll}
          onDelete={(product) => setDeleteTarget(product)}
        />
      )}

      {!showNoProducts && !showNoMatches && (
        <div className="h-16" aria-hidden="true" />
      )}

      <ProductBulkBar
        count={selection.count}
        categories={categories}
        onClear={selection.clear}
        onSetStatus={handleBulkSetStatus}
        onSetCategory={handleBulkSetCategory}
        onSetFeatured={handleBulkSetFeatured}
        onArchive={handleBulkArchive}
        onDelete={() => setBulkDeleteOpen(true)}
      />

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

      <ProductBulkConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        products={selectedRows}
        onConfirm={handleBulkDeleteConfirm}
      />

      <ProductImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        slug={storeSlug}
        categories={categories}
        onImported={handleImported}
      />
    </div>
  );
}