"use client";

import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { FashionModernHero } from "./hero";
import { FashionModernFeaturedProducts } from "./featured-products";
import { FashionModernPromoBanner } from "./promo-banner";
import { FashionModernTestimonials } from "./testimonials-section";
import { FashionModernProductCard } from "./product-card";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface FashionModernTemplateProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function FashionModernTemplate({ store, products }: FashionModernTemplateProps) {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const newArrivals = products.slice(0, 6);

  return (
    <StorefrontLayout store={store}>
      <FashionModernHero store={store} product={featured[0]} />
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-neutral-950">New Arrivals</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {newArrivals.map((product) => (
              <FashionModernProductCard key={product.id} product={product} store={store} />
            ))}
          </div>
        </div>
      </section>
      <FashionModernFeaturedProducts store={store} products={featured} />
      <FashionModernPromoBanner store={store} />
      <FashionModernTestimonials />
    </StorefrontLayout>
  );
}