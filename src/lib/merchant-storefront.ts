import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import { defaultMerchantStorefront } from "@/types/merchant-storefront";


export function normalizeMerchantStorefront(
  store: Partial<MerchantStorefrontConfig> | null | undefined,
): MerchantStorefrontConfig {
  const base = defaultMerchantStorefront;
  if (!store) return { ...base };

  // Ensure slug is never empty; generate from storeName if missing
  const slug = store.slug?.trim()
    ? store.slug
    : (store.storeName || base.storeName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

  return {
    ...base,
    ...store,
    slug,
    socialLinks: {
      ...base.socialLinks,
      ...(store.socialLinks || {}),
    },
  };
}