import Link from "next/link";
import { FashionModernProductCard } from "./product-card";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface FashionModernFeaturedProductsProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function FashionModernFeaturedProducts({ store, products }: FashionModernFeaturedProductsProps) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-neutral-950">
            Featured Pieces
          </h2>
          <Link
            href={`/ecommerce-stores/${store.slug}/products`}
            className="text-sm font-semibold uppercase tracking-wide"
            style={{ color: store.primaryColor }}
          >
            View All
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <FashionModernProductCard key={product.id} product={product} store={store} />
          ))}
        </div>
      </div>
    </section>
  );
}