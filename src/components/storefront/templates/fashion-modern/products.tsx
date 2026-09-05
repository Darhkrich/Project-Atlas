"use client";

import { useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { FashionModernProductCard } from "./product-card";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface FashionModernProductsPageProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function FashionModernProductsPage({ store, products }: FashionModernProductsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.categoryId)))];
  const filtered = products
    .filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.categoryId === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return (a.salePrice || a.price) - (b.salePrice || b.price);
      if (sortBy === "price-high") return (b.salePrice || b.price) - (a.salePrice || a.price);
      return 0;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold uppercase tracking-wider text-neutral-950">Shop</h1>
      <p className="mt-2 text-sm text-neutral-600">Discover the latest styles.</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-none border border-neutral-300 bg-white px-4 py-2.5 pl-10 text-sm"
          />
          <AtlasIcon name="search" className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-none border px-4 py-2 text-sm font-medium ${
                selectedCategory === cat ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {cat}
            </button>
          ))}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-none border border-neutral-300 bg-white px-3 py-2 text-sm"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-neutral-500">No products found.</div>
        ) : (
          filtered.map((product) => (
            <FashionModernProductCard key={product.id} product={product} store={store} />
          ))
        )}
      </div>
    </div>
  );
}