import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { generalStoreThemeStyles } from "./theme-styles";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface GeneralStoreHeroProps {
  store: MerchantStorefrontConfig;
  product?: MerchantStorefrontProduct;
}

export function GeneralStoreHero({ store, product }: GeneralStoreHeroProps) {
  const styles = generalStoreThemeStyles[store.theme] || generalStoreThemeStyles.modern;

  return (
    <section className={`relative overflow-hidden ${styles.heroBg}`}>
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-20">
        <div className="max-w-xl">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${store.primaryColor}15`, color: store.primaryColor }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: store.accentColor }} />
            {store.tagline}
          </span>
          <h1 className={`mt-4 text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${styles.heroText}`}>
            {store.heroTitle}
          </h1>
          <p className={`mt-4 max-w-lg text-base leading-7 ${store.theme === "bold" ? "text-neutral-300" : "text-neutral-600"}`}>
            {store.heroDescription}
          </p>

          {/* Search bar */}
          <form className="mt-6 flex max-w-md gap-2">
            <input
              type="search"
              placeholder="Search products..."
              className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
            <button
              type="submit"
              className="rounded-lg px-4 py-3 text-white"
              style={{ backgroundColor: store.primaryColor }}
            >
              <AtlasIcon name="search" className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/ecommerce-stores/${store.slug}/products`}
              className={`inline-flex h-12 items-center justify-center px-6 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 ${styles.button}`}
              style={{ backgroundColor: store.primaryColor }}
            >
              Shop Now
              <AtlasIcon name="arrow-right" className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={`/ecommerce-stores/${store.slug}/about`}
              className={`inline-flex h-12 items-center justify-center px-6 text-sm font-semibold ${styles.button} ${
                store.theme === "bold" ? "border border-white/50 bg-transparent text-white" : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              Learn More
            </Link>
          </div>

          {/* Trust indicators */}
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
            <div className={`relative overflow-hidden shadow-2xl ${styles.card} ${store.theme === "bold" ? "bg-neutral-900" : "bg-white"}`}>
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