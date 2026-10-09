"use client";

import { PromoCarousel } from "@/components/storefront/shared/promo-carousel";
import { getThemeDefinition } from "@/lib/merchant/storefront/themes";
import { visibleBanners } from "@/lib/merchant/storefront/promo-utils";
import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";

interface GeneralStorePromoBeforeHeroProps {
  store: MerchantStorefrontConfig;
}

export function GeneralStorePromoBeforeHero({
  store,
}: GeneralStorePromoBeforeHeroProps) {
  const theme = getThemeDefinition(store.theme);
  const banners = visibleBanners(store.promoBanners);
  if (banners.length === 0) return null;

  return (
    <section
      role="region"
      aria-label="Promotions"
      className={theme.color.pageBg}
    >
      <div
        className={`mx-auto ${theme.layout.containerWidth} px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10`}
      >
        <PromoCarousel
          store={store}
          banners={banners}
          placement="before_hero"
          transition={store.promoTransition ?? "auto"}
          autoIntervalMs={store.promoAutoIntervalMs ?? 5000}
          loop={store.promoLoop ?? true}
          aspectClass="aspect-[16/9] sm:aspect-[3/1] lg:aspect-[4/1]"
          maxHeightPx={320}
          className="overflow-hidden rounded-lg"
          ariaLabel="Promotions"
        />
      </div>
    </section>
  );
}