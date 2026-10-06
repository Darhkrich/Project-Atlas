"use client";

import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { GeneralStoreHero } from "./hero";
import { GeneralStoreFeaturedProducts } from "./featured-products";
import { GeneralStoreFeaturedCollection } from "./featured-collection";
import { AboutSection } from "@/components/storefront/shared/about-section";
import { TrustStrip } from "@/components/storefront/shared/trust-strip";
import { getThemeDefinition } from "@/lib/merchant/storefront/themes";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

const DEFAULT_SECTION_ORDER = [
  "hero",
  "trust",
  "collection",
  "featured",
  "about",
];

interface GeneralStoreTemplateProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function GeneralStoreTemplate({
  store,
  products,
}: GeneralStoreTemplateProps) {
  const theme = getThemeDefinition(store.theme);

  const heroProduct = products.find((p) => p.featured) ?? products[0];
  const featured = products.filter((p) => p.featured).slice(0, 8);
  const featuredForCollection =
    featured.length >= 3 ? featured : products.slice(0, 3);
  const trustItems = store.trustItems ?? [];

  const order =
    store.sectionOrder && store.sectionOrder.length > 0
      ? store.sectionOrder
      : DEFAULT_SECTION_ORDER;

  const showTrust =
    store.showTrustSection !== false && trustItems.length > 0;
  const showCollection = featuredForCollection.length === 3;
  const showFeatured =
    store.showFeaturedProducts !== false && featured.length > 0;
  const showAbout = store.showAbout !== false;

  return (
    <StorefrontLayout store={store}>
      {order.map((key) => {
        if (key === "hero") {
          return (
            <GeneralStoreHero
              key="hero"
              store={store}
              product={heroProduct}
            />
          );
        }
        if (key === "trust" && showTrust) {
          return (
            <TrustStrip
              key="trust"
              theme={theme}
              items={trustItems}
              accentColor={store.accentColor}
            />
          );
        }
        if (key === "collection" && showCollection) {
          return (
            <GeneralStoreFeaturedCollection
              key="collection"
              store={store}
              products={featuredForCollection}
            />
          );
        }
        if (key === "featured" && showFeatured) {
          return (
            <GeneralStoreFeaturedProducts
              key="featured"
              store={store}
              products={featured}
              allProducts={products}
            />
          );
        }
        if (key === "about" && showAbout) {
          return <AboutSection key="about" store={store} />;
        }
        return null;
      })}
    </StorefrontLayout>
  );
}