"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { CosmeticsLuxeProductCard } from "./product-card";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface CosmeticsLuxeProductsPageProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function CosmeticsLuxeProductsPage({ store, products }: CosmeticsLuxeProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.categoryId)))];
  const filtered = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#faf8f5] min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-950 sm:text-4xl">The Collection</h1>
          <p className="mt-2 text-neutral-600">Discover our curated selection.</p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-neutral-300 bg-white px-5 py-2.5 pl-10 text-sm"
            />
            <AtlasIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full border px-5 py-2 text-sm font-medium ${
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
              <CosmeticsLuxeProductCard key={product.id} product={product} store={store} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}