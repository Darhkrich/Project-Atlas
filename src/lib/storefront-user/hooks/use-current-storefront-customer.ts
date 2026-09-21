"use client";

import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";

export interface CurrentStorefrontCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  storefrontId: string;
  resellerSlug: string;
  twoFactorEnabled: boolean;
}

/**
 * Auth seam for the storefront user area. Reads the storefront customer
 * context. When real storefront auth ships, only this file changes.
 */
export function useCurrentStorefrontCustomer(): CurrentStorefrontCustomer | null {
  const { customer } = useStorefrontCustomer();
  if (!customer) return null;
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    storefrontId: customer.storefrontId ?? customer.resellerSlug,
    resellerSlug: customer.resellerSlug,
    twoFactorEnabled: customer.twoFactorEnabled ?? false,
  };
}