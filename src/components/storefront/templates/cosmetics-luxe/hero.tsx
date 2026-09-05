import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { cosmeticsLuxeThemeStyles } from "./theme-styles";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface CosmeticsLuxeHeroProps {
  store: MerchantStorefrontConfig;
  product?: MerchantStorefrontProduct;
}

export function CosmeticsLuxeHero({ store, product }: CosmeticsLuxeHeroProps) {
  const styles = cosmeticsLuxeThemeStyles[store.theme] || cosmeticsLuxeThemeStyles.modern;

  return (
    <section className={`relative overflow-hidden ${styles.heroBg}`}>
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div className="max-w-xl text-center lg:text-left">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{ backgroundColor: `${store.primaryColor}10`, color: store.primaryColor }}
          >
            {store.tagline}
          </span>
          <h1 className={`mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${styles.heroText}`}>
            {store.heroTitle}
          </h1>
          <p className={`mt-5 text-base leading-7 ${store.theme === "bold" ? "text-neutral-300" : "text-neutral-600"}`}>
            {store.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href={`/ecommerce-stores/${store.slug}/products`}
              className={`inline-flex h-12 items-center justify-center px-8 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 ${styles.button}`}
              style={{ backgroundColor: store.primaryColor }}
            >
              Shop Collection
              <AtlasIcon name="arrow-right" className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href={`/ecommerce-stores/${store.slug}/about`}
              className={`inline-flex h-12 items-center justify-center px-8 text-sm font-semibold ${styles.button} ${
                store.theme === "bold" ? "border border-white/50 bg-transparent text-white" : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              Our Story
            </Link>
          </div>
        </div>
        {product && (
          <div className="relative mx-auto lg:mx-0">
            <div className={`relative aspect-[4/5] w-full max-w-md overflow-hidden shadow-2xl ${styles.card}`}>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-4 backdrop-blur">
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