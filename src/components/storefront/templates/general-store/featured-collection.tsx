"use client";

import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { getThemeDefinition } from "@/lib/merchant/storefront/themes";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

interface GeneralStoreFeaturedCollectionProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function GeneralStoreFeaturedCollection({
  store,
  products,
}: GeneralStoreFeaturedCollectionProps) {
  const theme = getThemeDefinition(store.theme);

  const picks = products.slice(0, 3);
  if (picks.length < 3) return null;

  return (
    <section
      role="region"
      aria-label="Featured collection"
      className="w-full"
      style={{
        backgroundColor: `color-mix(in srgb, ${store.primaryColor} 88%, black)`,
        color: "#ffffff",
      }}
    >
      <div
        className={`mx-auto ${theme.layout.containerWidth} px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24`}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              This week
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              The collection
            </h2>
          </div>
          <Link
            href={`/ecommerce-stores/${store.slug}/products`}
            className="hidden items-center gap-1 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline sm:inline-flex"
          >
            See everything
            <AtlasIcon
              name="arrow-right"
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:gap-5 md:grid-cols-3">
          {picks.map((product, index) => (
            <Link
              key={product.id}
              href={`/ecommerce-stores/${store.slug}/products/${product.id}`}
              className="group block"
            >
              <div
                className="relative aspect-[4/5] w-full overflow-hidden"
                style={{ borderRadius: "var(--atlas-radius-lg)" }}
              >
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                    aria-hidden="true"
                  />
                )}
                <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-neutral-900">
                  {String(index + 1).padStart(2, "0")}
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {product.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-white/50">
                    {product.categoryId}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-bold text-white">
                  {"GH\u20B5 "}
                  {product.salePrice ?? product.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}