/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  storesWithProducts,
  type StoreWithProducts,
} from "@/lib/public-store";
import type {
  MerchantStorefrontConfig,
  MerchantStorefrontProduct,
} from "@/types/merchant-storefront";
import type { MerchantCategory } from "@/lib/merchant/categories/types";

const CONFIG_KEY = "atlas-merchant-storefronts";
const PRODUCTS_KEY = "atlas-store-products";
const CATEGORIES_KEY = "atlas-merchant-categories";

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function findOwnerEmailForSlug(slug: string): string | null {
  if (typeof window === "undefined") return null;
  const configs = readJson<Record<string, MerchantStorefrontConfig>>(
    CONFIG_KEY
  );
  if (!configs) return null;
  for (const [email, cfg] of Object.entries(configs)) {
    if (cfg && typeof cfg === "object" && cfg.slug === slug) {
      return email;
    }
  }
  return null;
}

// Reads a merchant's storefront config and product catalog from
// localStorage by slug. This is the bridge between the merchant's
// dashboard data and the public routes. It works only on the browser
// where the merchant built the store. Cross-device serving requires the
// backend.
function readMerchantEntry(slug: string): StoreWithProducts | undefined {
  if (typeof window === "undefined") return undefined;

  const ownerEmail = findOwnerEmailForSlug(slug);
  if (!ownerEmail) return undefined;

  const configs = readJson<Record<string, MerchantStorefrontConfig>>(
    CONFIG_KEY
  );
  const config = configs?.[ownerEmail];
  if (!config) return undefined;

  const productsByUser = readJson<
    Record<string, Record<string, MerchantStorefrontProduct[]>>
  >(PRODUCTS_KEY);

  const rawProducts = productsByUser?.[ownerEmail]?.[slug] ?? [];
  const products = rawProducts.filter(
    (p): p is MerchantStorefrontProduct =>
      !!p &&
      typeof p === "object" &&
      typeof (p as MerchantStorefrontProduct).id === "string"
  );

  return { store: config, products };
}

export function usePublicStore(
  slug: string
): StoreWithProducts | undefined {
  const [entry, setEntry] = useState<StoreWithProducts | undefined>(
    undefined
  );

  useEffect(() => {
    const merchant = readMerchantEntry(slug);
    if (merchant) {
      setEntry(merchant);
      return;
    }
    setEntry(storesWithProducts.find((s) => s.store.slug === slug));
  }, [slug]);

  return entry;
}

// Reads the merchant's category list by slug. Returns an empty array when
// no merchant exists for the slug or when no categories have been created.
// Used by templates to resolve a product's categoryId to a display label.
export function usePublicCategories(slug: string): MerchantCategory[] {
  const [categories, setCategories] = useState<MerchantCategory[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setCategories([]);
      return;
    }
    const ownerEmail = findOwnerEmailForSlug(slug);
    if (!ownerEmail) {
      setCategories([]);
      return;
    }
    const all = readJson<
      Record<string, Record<string, MerchantCategory[]>>
    >(CATEGORIES_KEY);
    const list = all?.[ownerEmail]?.[slug];
    if (!Array.isArray(list)) {
      setCategories([]);
      return;
    }
    const cleaned = list
      .filter(
        (c): c is MerchantCategory =>
          !!c &&
          typeof c === "object" &&
          typeof (c as MerchantCategory).id === "string" &&
          typeof (c as MerchantCategory).name === "string"
      )
      .sort((a, b) => a.order - b.order);
    setCategories(cleaned);
  }, [slug]);

  return categories;
}