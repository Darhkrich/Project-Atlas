import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface HeroSectionProps {
  store: MerchantStorefrontConfig;
  product?: MerchantStorefrontProduct;
  variant?: "split" | "centered" | "minimal";
}

export function HeroSection({ store, product, variant = "split" }: HeroSectionProps) {
  if (variant === "minimal") {
    return (
      <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
            {store.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-neutral-600">
            {store.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/ecommerce-stores/${store.slug}/products`}
              className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white"
              style={{ backgroundColor: store.primaryColor }}
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "centered") {
    return (
      <section className="relative overflow-hidden bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${store.primaryColor}15`, color: store.primaryColor }}>
            {store.tagline}
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
            {store.heroTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-neutral-600">
            {store.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/ecommerce-stores/${store.slug}/products`}
              className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white shadow-lg"
              style={{ backgroundColor: store.primaryColor }}
            >
              Shop Now
              <AtlasIcon name="arrow-right" className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Default split
  return (
    <section className="relative overflow-hidden bg-neutral-50">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-20">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${store.primaryColor}15`, color: store.primaryColor }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: store.accentColor }} />
            {store.tagline}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
            {store.heroTitle}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-neutral-600">
            {store.heroDescription}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/ecommerce-stores/${store.slug}/products`}
              className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: store.primaryColor }}
            >
              Shop Now
              <AtlasIcon name="arrow-right" className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={`/ecommerce-stores/${store.slug}/about`}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              Learn More
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-neutral-500">
            <span className="flex items-center gap-2">
              <AtlasIcon name="shield" className="h-4 w-4 text-green-600" />
              Secure payments
            </span>
            <span className="flex items-center gap-2">
              <AtlasIcon name="zap" className="h-4 w-4 text-green-600" />
              Fast delivery
            </span>
            <span className="flex items-center gap-2">
              <AtlasIcon name="headphones" className="h-4 w-4 text-green-600" />
              24/7 support
            </span>
          </div>
        </div>
        {product && (
          <div className="relative mt-6 lg:mt-0">
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={800}
                height={600}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-3 sm:p-4 backdrop-blur">
                <p className="text-sm font-semibold text-neutral-950">{product.name}</p>
                <p className="mt-1 text-lg font-bold" style={{ color: store.primaryColor }}>
                  GH₵ {product.salePrice || product.price}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}