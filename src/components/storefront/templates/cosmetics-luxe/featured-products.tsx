import Link from "next/link";
import { CosmeticsLuxeProductCard } from "./product-card";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface CosmeticsLuxeFeaturedProductsProps {
  store: MerchantStorefrontConfig;
  products: MerchantStorefrontProduct[];
}

export function CosmeticsLuxeFeaturedProducts({ store, products }: CosmeticsLuxeFeaturedProductsProps) {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
            Bestsellers
          </h2>
          <p className="mt-2 text-sm text-neutral-500">Our most loved products, curated for you.</p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <CosmeticsLuxeProductCard key={product.id} product={product} store={store} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={`/ecommerce-stores/${store.slug}/products`}
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: store.primaryColor }}
          >
            View all products
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}