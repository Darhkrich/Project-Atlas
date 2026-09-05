import Link from "next/link";
import Image from "next/image";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface AboutSectionProps {
  store: MerchantStorefrontConfig;
}

export function AboutSection({ store }: AboutSectionProps) {
  return (
    <section className="border-t border-neutral-200 bg-neutral-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
            alt="About our store"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-950 sm:text-3xl">
            About {store.storeName}
          </h2>
          <p className="mt-4 text-base leading-7 text-neutral-600">{store.description}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/ecommerce-stores/${store.slug}/contact`}
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: store.primaryColor }}
            >
              Contact Us
            </Link>
            <Link
              href={`/ecommerce-stores/${store.slug}/products`}
              className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}