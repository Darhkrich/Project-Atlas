"use client";

import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { getThemeDefinition } from "@/lib/merchant/storefront/themes";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

interface GeneralStoreHeroProps {
  store: MerchantStorefrontConfig;
  product?: MerchantStorefrontProduct;
}

export function GeneralStoreHero({ store, product }: GeneralStoreHeroProps) {
  const theme = getThemeDefinition(store.theme);

  const usesHeroImage = Boolean(store.heroImage);
  const imageSrc = store.heroImage ?? product?.images[0];
  const hasImage = Boolean(imageSrc);

  const headline = store.heroTitle.trim() || store.storeName;
  const tagline = store.tagline.trim();
  const description = store.heroDescription.trim();

  const promoText = (store.promoText ?? "").trim();
  const promoLink = (store.promoLink ?? "").trim();
  const promoLinkLabel = (store.promoLinkLabel ?? "").trim() || "Shop now";
  const showPromo = store.showPromoInHero === true && promoText.length > 0;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: `color-mix(in srgb, ${store.primaryColor} 5%, var(--atlas-bg))`,
      }}
    >
      <div
        className={`mx-auto ${theme.layout.containerWidth} px-4 sm:px-6 lg:px-8`}
      >
        <div
          className={`grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:gap-14 lg:py-28`}
        >
          <div className="lg:col-span-5">
            {tagline && (
              <p
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: store.primaryColor }}
              >
                {tagline}
              </p>
            )}
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
              {headline}
            </h1>
            {description && (
              <p
                className={`mt-7 max-w-xl text-lg leading-8 ${theme.color.textMuted}`}
              >
                {description}
              </p>
            )}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/ecommerce-stores/${store.slug}/products`}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: store.primaryColor,
                  borderRadius: "var(--atlas-radius-lg)",
                }}
              >
                Browse products
                <AtlasIcon
                  name="arrow-right"
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href={`/ecommerce-stores/${store.slug}/contact`}
                className="inline-flex items-center justify-center border px-7 py-4 text-sm font-semibold transition-colors hover:bg-white/50"
                style={{
                  borderColor: "var(--atlas-border)",
                  borderRadius: "var(--atlas-radius-lg)",
                }}
              >
                Contact us
              </Link>
            </div>
          </div>

          {hasImage && (
            <div className="lg:col-span-7 lg:-mr-8 xl:-mr-16">
              <div className="relative aspect-[4/3] w-full overflow-hidden shadow-2xl lg:aspect-[5/4]">
                <Image
                  src={imageSrc as string}
                  alt={
                    usesHeroImage
                      ? store.storeName
                      : product?.name ?? store.storeName
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                  priority
                />
                {!usesHeroImage && product && (
                  <div
                    className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 bg-white/95 px-5 py-4 backdrop-blur-sm dark:bg-neutral-900/95"
                    style={{ borderRadius: "var(--atlas-radius-md)" }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {product.name}
                      </p>
                      <p className={`text-xs ${theme.color.textMuted}`}>
                        Featured product
                      </p>
                    </div>
                    <p className="shrink-0 text-lg font-bold">
                      {"GH\u20B5 "}
                      {product.salePrice ?? product.price}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showPromo && (
        <div className="w-full" style={{ backgroundColor: store.primaryColor }}>
          <div
            className={`mx-auto ${theme.layout.containerWidth} flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8`}
          >
            <p className="text-sm font-semibold text-white">{promoText}</p>
            {promoLink.length > 0 && (
              <Link
                href={promoLink}
                className="inline-flex items-center gap-1 text-sm font-semibold text-white underline-offset-4 hover:underline"
              >
                {promoLinkLabel}
                <AtlasIcon
                  name="arrow-right"
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}