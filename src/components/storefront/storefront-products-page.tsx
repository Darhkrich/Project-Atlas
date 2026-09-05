"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { useCart } from "@/contexts/cart-context";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

export function StorefrontProductsPage({
  store,
  products,
}: {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { addItem } = useCart();

  // Extract unique categories
  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.categoryId))),
  ];

  const filtered = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.categoryId === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
          All Products
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Browse our collection of quality products.
        </p>
      </div>

      {/* Search */}
      <div className="mt-6 max-w-md">
        <div className="relative">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 pl-10 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <AtlasIcon
            name="search"
            className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-neutral-500">
            No products found.
          </div>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:shadow-lg"
            >
              <Link
                href={`/ecommerce-stores/${store.slug}/products/${product.id}`}
                className="block"
              >
                <div className="relative aspect-square overflow-hidden bg-neutral-100">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.salePrice && (
                    <span
                      className="absolute left-3 top-3 rounded-full px-2 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: store.accentColor }}
                    >
                      Sale
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="truncate text-sm font-semibold text-neutral-950">
                    {product.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <div>
                      <span
                        className="text-base font-bold"
                        style={{ color: store.primaryColor }}
                      >
                        GH₵ {product.salePrice || product.price}
                      </span>
                      {product.salePrice && (
                        <span className="ml-2 text-xs text-neutral-400 line-through">
                          GH₵ {product.price}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.salePrice || product.price,
                          image: product.images[0],
                        });
                      }}
                      className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
                      aria-label="Add to cart"
                    >
                      <AtlasIcon name="cart" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}