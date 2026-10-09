/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { SectionSurface } from "@/components/storefront/shared/section-surface";
import { GeneralStoreProductCard } from "./product-card";
import { getThemeDefinition } from "@/lib/merchant/storefront/themes";
import { resolveCategoryLabel } from "@/lib/merchant/storefront/category-labels";
import { usePublicCategories } from "@/lib/public-store-bridge";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

interface GeneralStoreProductsPageProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function GeneralStoreProductsPage({
  store,
  products,
}: GeneralStoreProductsPageProps) {
  const theme = getThemeDefinition(store.theme);
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryLookup = usePublicCategories(store.slug);

  const urlCategory = searchParams.get("category") ?? "All";

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSelectedCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const resolvedLabels = products.map((p) =>
    resolveCategoryLabel(p.categoryId, categoryLookup)
  );
  const categories = [
    "All",
    ...Array.from(new Set(resolvedLabels)),
  ];

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filtered = products.filter((product, index) => {
    const productLabel = resolvedLabels[index];
    const matchesCategory =
      selectedCategory === "All" || productLabel === selectedCategory;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.description.toLowerCase().includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });

  function handleCategoryChange(next: string) {
    setSelectedCategory(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "All") {
      params.delete("category");
    } else {
      params.set("category", next);
    }
    const query = params.toString();
    router.replace(query.length > 0 ? "?" + query : "?", { scroll: false });
  }

  return (
    <StorefrontLayout store={store}>
      <SectionSurface theme={theme} ariaLabel="Products">
        <header className="text-center">
          <h1 className={theme.typography.sectionTitle}>Products</h1>
        </header>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products"
              className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 pl-10 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-3 text-neutral-400"
            >
              {"\u2315"}
            </span>
          </div>

          {categories.length > 1 && (
            <ul role="list" className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => handleCategoryChange(cat)}
                      aria-pressed={isSelected}
                      className={
                        isSelected
                          ? "rounded-full border border-neutral-900 bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition-colors"
                          : "rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900"
                      }
                    >
                      {cat}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className={"mt-16 text-center text-sm " + theme.color.textMuted}>
            No products match this search.
          </p>
        ) : (
          <div className={"atlas-product-grid mt-8 " + theme.layout.gridGap}>
            {filtered.map((product) => (
              <GeneralStoreProductCard
                key={product.id}
                product={product}
                store={store}
              />
            ))}
          </div>
        )}
      </SectionSurface>
    </StorefrontLayout>
  );
}