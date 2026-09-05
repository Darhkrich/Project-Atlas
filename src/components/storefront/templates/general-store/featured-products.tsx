import Link from "next/link";
import { GeneralStoreProductCard } from "./product-card";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface GeneralStoreFeaturedProductsProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function GeneralStoreFeaturedProducts({ store, products }: GeneralStoreFeaturedProductsProps) {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
              Featured Products
            </h2>
            <p className="mt-2 text-sm text-neutral-500">Handpicked favorites from our store.</p>
          </div>
          <Link
            href={`/ecommerce-stores/${store.slug}/products`}
            className="hidden text-sm font-semibold sm:block"
            style={{ color: store.primaryColor }}
          >
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <GeneralStoreProductCard key={product.id} product={product} store={store} />
          ))}
        </div>
      </div>
    </section>
  );
}