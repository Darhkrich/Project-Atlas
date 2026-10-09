/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { MerchantStorefrontProduct } from "@/types/merchant-storefront";
import { useAuth } from "@/contexts/auth-context";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import {
  evaluateAddProductGate,
  evaluateProductLimit,
  resolveActivePlanId,
} from "@/lib/merchant/products/limits";

type StoreProductsMap = Record<string, MerchantStorefrontProduct[]>;
type UserProductsMap = Record<string, StoreProductsMap>;

export interface AddProductResult {
  ok: boolean;
  error?: string;
}

export interface AddProductsResult {
  ok: boolean;
  added: number;
  skipped: number;
  error?: string;
}

interface StoreProductsContextType {
  productsByStore: StoreProductsMap;
  getProductsForStore: (slug: string) => MerchantStorefrontProduct[];
  addProduct: (
    slug: string,
    product: MerchantStorefrontProduct
  ) => AddProductResult;
  addProducts: (
    slug: string,
    products: MerchantStorefrontProduct[]
  ) => AddProductsResult;
  updateProduct: (
    slug: string,
    productId: string,
    updates: Partial<MerchantStorefrontProduct>
  ) => void;
  updateProducts: (
    slug: string,
    productIds: string[],
    updates: Partial<MerchantStorefrontProduct>
  ) => void;
  deleteProduct: (slug: string, productId: string) => void;
  deleteProducts: (slug: string, productIds: string[]) => void;
  seedProducts: (slug: string, products: MerchantStorefrontProduct[]) => void;
}

const StoreProductsContext = createContext<
  StoreProductsContextType | undefined
>(undefined);

const STORAGE_KEY = "atlas-store-products";

function sanitizeMap(value: unknown): UserProductsMap {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const out: UserProductsMap = {};
  for (const [email, stores] of Object.entries(
    value as Record<string, unknown>
  )) {
    if (stores === null || typeof stores !== "object" || Array.isArray(stores)) {
      continue;
    }
    const storeOut: StoreProductsMap = {};
    for (const [slug, list] of Object.entries(
      stores as Record<string, unknown>
    )) {
      if (!Array.isArray(list)) continue;
      storeOut[slug] = list.filter(
        (p): p is MerchantStorefrontProduct =>
          p !== null &&
          typeof p === "object" &&
          typeof (p as Record<string, unknown>).id === "string" &&
          typeof (p as Record<string, unknown>).name === "string"
      );
    }
    out[email] = storeOut;
  }
  return out;
}

export function StoreProductsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { storefrontConfig } = useStorefrontConfig();
  const [allUserProducts, setAllUserProducts] = useState<UserProductsMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        setAllUserProducts(sanitizeMap(parsed));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allUserProducts));
    } catch {
      // Quota. State stays in memory.
    }
  }, [allUserProducts, loaded]);

  const userKey = user?.email || "guest";
  const productsByStore = allUserProducts[userKey] || {};

  const persist = (map: StoreProductsMap) => {
    setAllUserProducts((prev) => ({
      ...prev,
      [userKey]: map,
    }));
  };

  const getProductsForStore = (slug: string) => {
    return productsByStore[slug] || [];
  };

  const addProduct = (
    slug: string,
    product: MerchantStorefrontProduct
  ): AddProductResult => {
    const current = productsByStore[slug] || [];

    const isTargetStore =
      (storefrontConfig.slug || "my-store") === slug;
    if (isTargetStore) {
      const planId = resolveActivePlanId(storefrontConfig);
      const evaluation = evaluateProductLimit(planId, current.length);
      const gate = evaluateAddProductGate(evaluation);
      if (!gate.ok) {
        return { ok: false, error: gate.error };
      }
    }

    persist({ ...productsByStore, [slug]: [...current, product] });
    return { ok: true };
  };

  const addProducts = (
    slug: string,
    products: MerchantStorefrontProduct[]
  ): AddProductsResult => {
    if (products.length === 0) {
      return { ok: true, added: 0, skipped: 0 };
    }

    const current = productsByStore[slug] || [];
    const isTargetStore = (storefrontConfig.slug || "my-store") === slug;

    if (isTargetStore) {
      const planId = resolveActivePlanId(storefrontConfig);
      const evaluation = evaluateProductLimit(planId, current.length);

      if (evaluation.isUnlimited || evaluation.remaining === null) {
        persist({
          ...productsByStore,
          [slug]: [...current, ...products],
        });
        return { ok: true, added: products.length, skipped: 0 };
      }

      const remaining = Math.max(0, evaluation.remaining);
      if (remaining === 0) {
        return {
          ok: false,
          added: 0,
          skipped: products.length,
          error: "Your plan has no room for more products.",
        };
      }

      const toAdd = products.slice(0, remaining);
      const skippedCount = products.length - toAdd.length;
      persist({
        ...productsByStore,
        [slug]: [...current, ...toAdd],
      });
      return { ok: true, added: toAdd.length, skipped: skippedCount };
    }

    persist({
      ...productsByStore,
      [slug]: [...current, ...products],
    });
    return { ok: true, added: products.length, skipped: 0 };
  };

  const updateProduct = (
    slug: string,
    productId: string,
    updates: Partial<MerchantStorefrontProduct>
  ) => {
    const current = productsByStore[slug] || [];
    const updatedProducts = current.map((p) =>
      p.id === productId ? { ...p, ...updates } : p
    );
    persist({ ...productsByStore, [slug]: updatedProducts });
  };

  const updateProducts = (
    slug: string,
    productIds: string[],
    updates: Partial<MerchantStorefrontProduct>
  ) => {
    if (productIds.length === 0) return;
    const current = productsByStore[slug] || [];
    const idSet = new Set(productIds);
    const next = current.map((p) =>
      idSet.has(p.id) ? { ...p, ...updates } : p
    );
    persist({ ...productsByStore, [slug]: next });
  };

  const deleteProduct = (slug: string, productId: string) => {
    const current = productsByStore[slug] || [];
    const updatedProducts = current.filter((p) => p.id !== productId);
    persist({ ...productsByStore, [slug]: updatedProducts });
  };

  const deleteProducts = (slug: string, productIds: string[]) => {
    if (productIds.length === 0) return;
    const current = productsByStore[slug] || [];
    const idSet = new Set(productIds);
    const next = current.filter((p) => !idSet.has(p.id));
    persist({ ...productsByStore, [slug]: next });
  };

  const seedProducts = (
    slug: string,
    products: MerchantStorefrontProduct[]
  ) => {
    if ((productsByStore[slug] || []).length === 0) {
      persist({ ...productsByStore, [slug]: products });
    }
  };

  return (
    <StoreProductsContext.Provider
      value={{
        productsByStore,
        getProductsForStore,
        addProduct,
        addProducts,
        updateProduct,
        updateProducts,
        deleteProduct,
        deleteProducts,
        seedProducts,
      }}
    >
      {children}
    </StoreProductsContext.Provider>
  );
}

export function useStoreProducts() {
  const context = useContext(StoreProductsContext);
  if (!context) {
    throw new Error(
      "useStoreProducts must be used within StoreProductsProvider"
    );
  }
  return context;
}