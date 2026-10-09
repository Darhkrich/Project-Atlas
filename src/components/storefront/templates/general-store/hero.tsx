"use client";

import Link from "next/link";
import Image from "next/image";
import { AtlasIcon } from "@/components/atlas/icons";
import { HeroBackgroundCarousel } from "@/components/storefront/shared/hero-background-carousel";
import { getThemeDefinition } from "@/lib/merchant/storefront/themes";
import { visibleBanners } from "@/lib/merchant/storefront/promo-utils";
import type {
  HeroStyle,
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";

interface GeneralStoreHeroProps {
  store: MerchantStorefrontConfig;
  product?: MerchantStorefrontProduct;
}

type ResolvedLayout =
  | "side-image"
  | "centered"
  | "full-bleed"
  | "minimal-split"
  | "text-only";

function resolveLayout(
  heroStyle: HeroStyle,
  themeHero: string
): ResolvedLayout {
  if (heroStyle === "image_background") return "full-bleed";
  if (heroStyle === "image_side") return "side-image";
  if (heroStyle === "image_half") return "minimal-split";
  if (heroStyle === "text_only") return "text-only";
  if (themeHero === "full-bleed") return "full-bleed";
  if (themeHero === "centered") return "centered";
  if (themeHero === "minimal-split") return "minimal-split";
  return "side-image";
}

export function GeneralStoreHero({ store, product }: GeneralStoreHeroProps) {
  const theme = getThemeDefinition(store.theme);

  const banners = visibleBanners(store.promoBanners);
  if (store.promoPlacement === "as_hero_background" && banners.length > 0) {
    return (
      <HeroBackgroundCarousel
        banners={banners}
        slug={store.slug}
        transition={store.promoTransition ?? "auto"}
        autoIntervalMs={store.promoAutoIntervalMs ?? 5000}
        loop={store.promoLoop ?? true}
      />
    );
  }

  const layout = resolveLayout(
    store.heroStyle ?? "theme_default",
    theme.variants.hero
  );

  const headline = store.heroTitle.trim() || store.storeName;
  const tagline = store.tagline.trim();
  const description = store.heroDescription.trim();

  const usesHeroImage = Boolean(store.heroImage);
  const imageSrc = store.heroImage ?? product?.images[0];
  const hasImage = Boolean(imageSrc);
  const imageAlt = usesHeroImage
    ? store.storeName
    : product?.name ?? store.storeName;

  const copy = (
    <>
      {tagline && (
        <p className={theme.typography.sectionEyebrow}>{tagline}</p>
      )}
      <h1 className={`mt-3 ${theme.typography.heroTitle}`}>{headline}</h1>
      {description && (
        <p
          className={`mt-5 max-w-xl ${theme.typography.body} ${theme.color.textMuted}`}
        >
          {description}
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/ecommerce-stores/${store.slug}/products`}
          className={`inline-flex items-center justify-center gap-2 ${theme.components.buttonPrimary}`}
          style={{ backgroundColor: store.primaryColor }}
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
          className={`inline-flex items-center justify-center ${theme.components.buttonSecondary}`}
        >
          Contact us
        </Link>
      </div>
    </>
  );

  if (layout === "full-bleed" && hasImage) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative w-full" style={{ minHeight: "70vh" }}>
          <Image
            src={imageSrc as string}
            alt={imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.15) 55%, rgba(0,0,0,0))",
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full min-h-[70vh] items-end">
            <div
              className={`mx-auto ${theme.layout.containerWidth} w-full px-4 pb-16 text-white sm:px-6 sm:pb-20 lg:px-8 lg:pb-24`}
            >
              {copy}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout === "text-only" || !hasImage) {
    return (
      <section className={`${theme.color.heroBg} ${theme.color.textPrimary}`}>
        <div
          className={`mx-auto ${theme.layout.containerWidth} px-4 sm:px-6 lg:px-8`}
        >
          <div className="mx-auto max-w-3xl py-24 text-center sm:py-28 lg:py-32">
            <div className="text-center">
              {tagline && (
                <p className={theme.typography.sectionEyebrow}>{tagline}</p>
              )}
              <h1 className={`mt-3 ${theme.typography.heroTitle}`}>
                {headline}
              </h1>
              {description && (
                <p
                  className={`mx-auto mt-5 max-w-xl ${theme.typography.body} ${theme.color.textMuted}`}
                >
                  {description}
                </p>
              )}
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={`/ecommerce-stores/${store.slug}/products`}
                  className={`inline-flex items-center justify-center gap-2 ${theme.components.buttonPrimary}`}
                  style={{ backgroundColor: store.primaryColor }}
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
                  className={`inline-flex items-center justify-center ${theme.components.buttonSecondary}`}
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout === "minimal-split") {
    return (
      <section className={`${theme.color.heroBg} ${theme.color.textPrimary}`}>
        <div
          className={`mx-auto ${theme.layout.containerWidth} px-4 sm:px-6 lg:px-8`}
        >
          <div className="grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-14 lg:py-24">
            <div className="flex flex-col justify-center">{copy}</div>
            <div
              className={`relative aspect-[4/5] w-full overflow-hidden ${theme.imagery.imageRadius}`}
            >
              <Image
                src={imageSrc as string}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${theme.color.heroBg} ${theme.color.textPrimary}`}>
      <div
        className={`mx-auto ${theme.layout.containerWidth} px-4 sm:px-6 lg:px-8`}
      >
        <div className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:gap-14 lg:py-24">
          <div className="lg:col-span-5">{copy}</div>
          <div className="lg:col-span-7 lg:-mr-8 xl:-mr-16">
            <div
              className={`relative aspect-[4/3] w-full overflow-hidden lg:aspect-[5/4] ${theme.imagery.imageRadius}`}
            >
              <Image
                src={imageSrc as string}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}