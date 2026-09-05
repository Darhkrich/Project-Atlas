import { ProductCard } from "./product-card";
import { SectionHeader } from "./section-header";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface FeaturedProductsProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function FeaturedProducts({ store, products }: FeaturedProductsProps) {
  return (
    <section className="px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          title="Featured Products"
          description="Handpicked favorites from our store."
          linkHref={`/ecommerce-stores/${store.slug}/products`}
        />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} store={store} />
          ))}
        </div>
      </div>
    </section>
  );
}