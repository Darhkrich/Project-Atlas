"use client";

import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { GeneralStoreHero } from "./hero";
import { GeneralStoreFeaturedProducts } from "./featured-products";
import { GeneralStorePromoBanner } from "./promo-banner";
import { GeneralStoreTestimonials } from "./testimonials-section";
import { CategoryGrid } from "./category-grid";
import { AboutSection } from "@/components/storefront/shared/about-section";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface GeneralStoreTemplateProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function GeneralStoreTemplate({ store, products }: GeneralStoreTemplateProps) {
  const heroProduct = products.find((p) => p.featured) || products[0];
  const featured = products.filter((p) => p.featured).slice(0, 8);

  const categories = [
    { name: "Electronics", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop" },
    { name: "Home", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&h=400&fit=crop" },
    { name: "Fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop" },
    { name: "Beauty", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop" },
  ];

  return (
    <StorefrontLayout store={store}>
      <GeneralStoreHero store={store} product={heroProduct} />
      {store.theme !== "minimal" && <CategoryGrid store={store} categories={categories} />}
      {store.showFeaturedProducts && <GeneralStoreFeaturedProducts store={store} products={featured} />}
      {store.theme !== "minimal" && <GeneralStorePromoBanner store={store} />}
      <AboutSection store={store} />
      <GeneralStoreTestimonials />
    </StorefrontLayout>
  );
}