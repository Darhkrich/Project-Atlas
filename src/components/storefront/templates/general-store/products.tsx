/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { GeneralStoreProductCard } from "./product-card";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface GeneralStoreProductsPageProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function GeneralStoreProductsPage({ store, products }: GeneralStoreProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.categoryId)))];
  const filtered = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">Our Products</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-neutral-600">
          Browse our collection and find something you'll love.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 pl-10 text-sm"
          />
          <AtlasIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full border px-4 py-2 text-sm font-medium ${
                selectedCategory === cat ? "border-brand-600 bg-brand-50 text-brand-700" : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-neutral-500">No products found.</div>
        ) : (
          filtered.map((product) => (
            <GeneralStoreProductCard key={product.id} product={product} store={store} />
          ))
        )}
      </div>
    </div>
  );
}