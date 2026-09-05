/* eslint-disable @typescript-eslint/no-unused-vars */
import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { fashionModernThemeStyles } from "./theme-styles";
import type { MerchantStorefrontConfig, MerchantStorefrontProduct } from "@/types/merchant-storefront";

interface FashionModernHeroProps {
  store: MerchantStorefrontConfig;
  product?: MerchantStorefrontProduct;
}

export function FashionModernHero({ store, product }: FashionModernHeroProps) {
  const styles = fashionModernThemeStyles[store.theme] || fashionModernThemeStyles.modern;

  return (
    <section className={`relative h-[500px] overflow-hidden ${styles.heroBg}`}>
      <Image
        src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=900&fit=crop"
        alt="Fashion hero"
        fill
        sizes="100vw"
        className="object-cover opacity-70"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 flex h-full items-center justify-center text-center">
        <div className="max-w-2xl px-4">
          <h1 className={`text-4xl font-bold sm:text-5xl lg:text-6xl ${styles.heroText}`}>
            {store.heroTitle}
          </h1>
          <p className={`mt-4 text-lg ${store.theme === "bold" ? "text-neutral-300" : "text-white/80"}`}>
            {store.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/ecommerce-stores/${store.slug}/products`}
              className={`inline-flex h-12 items-center justify-center px-8 text-sm font-bold text-neutral-900 ${styles.button} ${
                store.theme === "bold" || store.theme === "modern" ? "bg-white hover:bg-neutral-100" : "bg-white"
              }`}
            >
              Shop New Arrivals
            </Link>
            <Link
              href={`/ecommerce-stores/${store.slug}/products`}
              className={`inline-flex h-12 items-center justify-center px-8 text-sm font-bold text-white backdrop-blur ${styles.button} ${
                store.theme === "bold" || store.theme === "modern" ? "border border-white/50 bg-transparent hover:bg-white/10" : "border border-neutral-300 bg-transparent text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              View Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}