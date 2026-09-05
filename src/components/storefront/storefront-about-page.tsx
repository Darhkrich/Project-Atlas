import Image from "next/image";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface StorefrontAboutPageProps {
  store: MerchantStorefrontConfig;
}

export function StorefrontAboutPage({ store }: StorefrontAboutPageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-950 sm:text-4xl">
          About {store.storeName}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-neutral-600">
          {store.description}
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800&h=600&fit=crop"
            alt="About our store"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Text */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-950">Our Story</h2>
          <p className="mt-4 text-base leading-7 text-neutral-600">
            {store.description}
          </p>
          <p className="mt-4 text-base leading-7 text-neutral-600">
            We are committed to providing high-quality products and excellent
            customer service. Our mission is to make shopping easy, fast, and
            enjoyable for everyone.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
              <AtlasIcon name="shield" className="mx-auto h-6 w-6 text-success-600" />
              <p className="mt-2 text-sm font-semibold">Secure Payments</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
              <AtlasIcon name="zap" className="mx-auto h-6 w-6 text-success-600" />
              <p className="mt-2 text-sm font-semibold">Fast Delivery</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4 text-center">
              <AtlasIcon name="headphones" className="mx-auto h-6 w-6 text-success-600" />
              <p className="mt-2 text-sm font-semibold">24/7 Support</p>
            </div>
          </div>

          <Link
            href={`/ecommerce-stores/${store.slug}/products`}
            className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: store.primaryColor }}
          >
            Browse Products
            <AtlasIcon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}