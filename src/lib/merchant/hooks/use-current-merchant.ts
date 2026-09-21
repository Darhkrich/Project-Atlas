"use client";

import { useAuth } from "@/contexts/auth-context";

export interface CurrentMerchant {
  id: string;
  name: string;
  email: string;
  storefrontId: string;
  storeSlug: string;
}

const FALLBACK_MERCHANT: CurrentMerchant = {
  id: "MER-001",
  name: "TechHub Store",
  email: "nana@techhub.com",
  storefrontId: "SF-MER-001",
  storeSlug: "techhub",
};

/**
 * The auth seam for the merchant area. Until the real auth layer ships,
 * returns the seeded merchant regardless of what the mock session holds.
 *
 * When real auth ships, this reads the session and returns the signed-in
 * merchant's id, name, email, storefront id, and storefront slug. Callers
 * do not change.
 */
export function useCurrentMerchant(): CurrentMerchant | null {
  const { user } = useAuth();
  void user;
  return FALLBACK_MERCHANT;
}