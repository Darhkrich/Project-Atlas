"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { SectionSurface } from "@/components/storefront/shared/section-surface";
import { GeneralStoreProductCard } from "./product-card";
import { getThemeDefinition } from "@/lib/merchant/storefront/themes";
import { resolveCategoryLabel } from "@/lib/merchant/storefront/category-labels";
import { usePublicCategories } from "@/lib/public-store-bridge";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

interface GeneralStoreFeaturedProductsProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
  allProducts: MerchantStorefrontProduct[];
}

export function GeneralStoreFeaturedProducts({
  store,
  products,
  allProducts,
}: GeneralStoreFeaturedProductsProps) {
  const theme = getThemeDefinition(store.theme);
  const categoryLookup = usePublicCategories(store.slug);

  if (products.length === 0) return null;

  const counts = new Map<string, number>();
  for (const p of allProducts) {
    const label = resolveCategoryLabel(p.categoryId, categoryLookup);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const categories = Array.from(counts.keys()).slice(0, 6);

  return (
    <SectionSurface theme={theme} ariaLabel="Featured products">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Featured products
          </h2>
          <p className={`mt-2 text-sm ${theme.color.textMuted}`}>
            Handpicked from our store
          </p>
        </div>
        <Link
          href={`/ecommerce-stores/${store.slug}/products`}
          className="hidden items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline sm:inline-flex"
        >
          View all
          <AtlasIcon
            name="arrow-right"
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Link>
      </div>

      {categories.length > 1 && (
        <ul role="list" className="mt-7 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <li key={cat} className="shrink-0">
              <Link
                href={`/ecommerce-stores/${store.slug}/products?category=${encodeURIComponent(cat)}`}
                className="inline-flex items-center border px-4 py-2 text-xs font-semibold transition-colors hover:border-neutral-900"
                style={{
                  borderColor: "var(--atlas-border)",
                  borderRadius: "var(--atlas-radius-full)",
                }}
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className={index === 0 ? "col-span-2 sm:col-span-1" : ""}
          >
            <GeneralStoreProductCard product={product} store={store} />
          </div>
        ))}
      </div>
    </SectionSurface>
  );
}