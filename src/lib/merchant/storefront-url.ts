import type { MerchantStorefrontConfig } from "@/types/merchant-storefront";
import type { StorefrontDomain } from "@/lib/domains/types";
import {
  primaryHostnameFor,
  subdomainFor,
} from "@/lib/domains/projection";

// Reads the deprecated domain fields on MerchantStorefrontConfig. Used by
// consumers that have not yet migrated to reading from the domain store.
// Do not add new callers. Use storefrontUrlFromDomain instead.
export function storefrontUrlFor(store: MerchantStorefrontConfig): string {
  if (store.customDomain && store.customDomainStatus === "verified") {
    return "https://" + store.customDomain;
  }
  if (store.atlasDomain) {
    return "https://" + store.atlasDomain;
  }
  if (store.subdomain) {
    return "https://" + store.subdomain + ".atlas.com";
  }
  if (store.slug) {
    return "https://" + store.slug + ".atlas.com";
  }
  return "https://atlas.com/ecommerce";
}

export function storefrontDisplayUrl(store: MerchantStorefrontConfig): string {
  return storefrontUrlFor(store).replace(/^https?:\/\//, "");
}

export function storefrontUrlFromDomain(domain: StorefrontDomain): string {
  return "https://" + primaryHostnameFor(domain);
}

export function storefrontDisplayUrlFromDomain(
  domain: StorefrontDomain
): string {
  return primaryHostnameFor(domain);
}

export function subdomainDisplayUrl(domain: StorefrontDomain): string {
  return subdomainFor(domain);
}