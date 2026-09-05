"use client";

import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { CosmeticsLuxeHero } from "./hero";
import { CosmeticsLuxeFeaturedProducts } from "./featured-products";
import { CosmeticsLuxePromoBanner } from "./promo-banner";
import { CosmeticsLuxeTestimonials } from "./testimonials-section";
import { AboutSection } from "@/components/storefront/shared/about-section";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface CosmeticsLuxeTemplateProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function CosmeticsLuxeTemplate({ store, products }: CosmeticsLuxeTemplateProps) {
  const heroProduct = products.find((p) => p.featured) || products[0];
  const featured = products.filter((p) => p.featured).slice(0, 8);

  return (
    <StorefrontLayout store={store}>
      <CosmeticsLuxeHero store={store} product={heroProduct} />
      {store.showFeaturedProducts && <CosmeticsLuxeFeaturedProducts store={store} products={featured} />}
      <CosmeticsLuxePromoBanner store={store} />
      <AboutSection store={store} />
      <CosmeticsLuxeTestimonials />
    </StorefrontLayout>
  );
}